const path = require("path");
const fs = require("fs/promises");
const Submission = require("../models/Submission");
const User = require("../models/User");
const {
  hashBuffer,
  signHash,
  verifyHashSignature,
  encryptFileBuffer,
  encryptSessionKey,
  decryptSessionKey,
  decryptFileBuffer
} = require("../services/cryptoService");
const { createAuditLog } = require("../services/auditService");

const createSubmission = async (req, res) => {
  try {
    const { title, courseCode, examOfficerId, privateKey } = req.body;

    if (!title || !courseCode || !examOfficerId || !privateKey) {
      return res.status(400).json({
        message: "Title, course code, exam officer, and lecturer private key are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Exam paper file is required" });
    }

    const lecturer = await User.findById(req.user._id).select("name email role publicKey");

    if (!lecturer.publicKey) {
      return res.status(400).json({ message: "Generate your lecturer public/private key pair before submitting" });
    }

    const examOfficer = await User.findOne({ _id: examOfficerId, role: "exam_officer" });

    if (!examOfficer) {
      return res.status(404).json({ message: "Selected exam officer was not found" });
    }

    if (!examOfficer.publicKey) {
      return res.status(400).json({
        message: "Selected exam officer does not have a public key yet"
      });
    }

    const fileHash = hashBuffer(req.file.buffer);
    const digitalSignature = signHash(fileHash, privateKey);

    await createAuditLog({
      user: req.user._id,
      action: "PAPER_UPLOADED",
      resourceType: "Submission",
      status: "success",
      details: `Original file received: ${req.file.originalname}`,
      ipAddress: req.ip
    });

    const { encryptedFile, sessionKey, iv, authTag } = encryptFileBuffer(req.file.buffer);
    const encryptedSessionKey = encryptSessionKey(sessionKey, examOfficer.publicKey);

    const uploadDir = path.resolve(__dirname, "../..", process.env.UPLOAD_DIR || "../storage/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeOriginalName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const encryptedFileName = `${Date.now()}-${req.user._id}-${safeOriginalName}.enc`;
    const encryptedFilePath = path.join(uploadDir, encryptedFileName);
    await fs.writeFile(encryptedFilePath, encryptedFile);

    const submission = await Submission.create({
      title: title.trim(),
      courseCode: courseCode.trim(),
      lecturer: req.user._id,
      examOfficer: examOfficer._id,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      encryptedFilePath,
      encryptedSessionKey,
      fileHash,
      digitalSignature,
      authTag,
      iv,
      status: "submitted"
    });

    await createAuditLog({
      user: req.user._id,
      action: "PAPER_ENCRYPTED",
      resourceType: "Submission",
      resourceId: submission._id.toString(),
      status: "success",
      details: `Paper encrypted with AES-256-GCM and AES key encrypted for ${examOfficer.email}`,
      ipAddress: req.ip
    });

    await createAuditLog({
      user: req.user._id,
      action: "SUBMISSION_CREATED",
      resourceType: "Submission",
      resourceId: submission._id.toString(),
      status: "success",
      details: `Encrypted exam paper submitted for ${courseCode}`,
      ipAddress: req.ip
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("lecturer", "name email role")
      .populate("examOfficer", "name email role");

    res.status(201).json({
      message: "Exam paper encrypted, signed, and submitted successfully",
      submission: populatedSubmission
    });
  } catch (error) {
    await createAuditLog({
      user: req.user?._id,
      action: "SUBMISSION_CREATED",
      resourceType: "Submission",
      status: "failure",
      details: error.message,
      ipAddress: req.ip
    });

    res.status(500).json({ message: "Failed to submit exam paper", error: error.message });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "lecturer") {
      filter.lecturer = req.user._id;
    }

    if (req.user.role === "exam_officer") {
      filter.examOfficer = req.user._id;
    }

    const submissions = await Submission.find(filter)
      .populate("lecturer", "name email role")
      .populate("examOfficer", "name email role")
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: "Failed to load submissions", error: error.message });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("lecturer", "name email role")
      .populate("examOfficer", "name email role");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const isLecturerOwner = req.user.role === "lecturer" && submission.lecturer._id.equals(req.user._id);
    const isAssignedExamOfficer =
      req.user.role === "exam_officer" && submission.examOfficer._id.equals(req.user._id);

    if (!isLecturerOwner && !isAssignedExamOfficer) {
      return res.status(403).json({ message: "You do not have permission to access this submission" });
    }

    res.json({ submission });
  } catch (error) {
    res.status(500).json({ message: "Failed to load submission", error: error.message });
  }
};

const findAssignedSubmission = async (submissionId, userId) => {
  const submission = await Submission.findById(submissionId)
    .populate("lecturer", "name email role publicKey")
    .populate("examOfficer", "name email role publicKey");

  if (!submission) {
    return null;
  }

  if (!submission.examOfficer._id.equals(userId)) {
    const error = new Error("You do not have permission to access this submission");
    error.statusCode = 403;
    throw error;
  }

  return submission;
};

const verifySubmission = async (req, res) => {
  try {
    const submission = await findAssignedSubmission(req.params.id, req.user._id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (!submission.lecturer.publicKey) {
      return res.status(400).json({ message: "Lecturer public key is not available" });
    }

    const signatureValid = verifyHashSignature(
      submission.fileHash,
      submission.digitalSignature,
      submission.lecturer.publicKey
    );

    submission.status = signatureValid ? "verified" : "rejected";
    await submission.save();

    await createAuditLog({
      user: req.user._id,
      action: "SUBMISSION_VERIFIED",
      resourceType: "Submission",
      resourceId: submission._id.toString(),
      status: signatureValid ? "success" : "failure",
      details: signatureValid ? "Digital signature is valid" : "Digital signature is invalid",
      ipAddress: req.ip
    });

    res.json({
      message: signatureValid ? "Digital signature is valid" : "Digital signature is invalid",
      result: {
        signatureValid,
        status: submission.status
      },
      submission
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to verify submission",
      error: error.message
    });
  }
};

const decryptSubmission = async (req, res) => {
  try {
    const { privateKey } = req.body;

    if (!privateKey) {
      return res.status(400).json({ message: "Exam officer private key is required" });
    }

    const submission = await findAssignedSubmission(req.params.id, req.user._id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const signatureValid = verifyHashSignature(
      submission.fileHash,
      submission.digitalSignature,
      submission.lecturer.publicKey
    );

    const sessionKey = decryptSessionKey(submission.encryptedSessionKey, privateKey);
    const encryptedFile = await fs.readFile(submission.encryptedFilePath);
    const decryptedFile = decryptFileBuffer({
      encryptedFile,
      sessionKey,
      iv: submission.iv,
      authTag: submission.authTag
    });

    const decryptedHash = hashBuffer(decryptedFile);
    const integrityPassed = decryptedHash === submission.fileHash;
    const decryptedSuccessfully = signatureValid && integrityPassed;

    submission.status = decryptedSuccessfully ? "decrypted" : "rejected";
    await submission.save();

    await createAuditLog({
      user: req.user._id,
      action: "SUBMISSION_DECRYPTED",
      resourceType: "Submission",
      resourceId: submission._id.toString(),
      status: decryptedSuccessfully ? "success" : "failure",
      details: decryptedSuccessfully
        ? "Paper decrypted and integrity check passed"
        : "Paper decryption result failed validation",
      ipAddress: req.ip
    });

    res.json({
      message: decryptedSuccessfully
        ? "Paper decrypted successfully"
        : "Paper decrypted but validation failed",
      result: {
        signatureValid,
        integrityPassed,
        decryptedSuccessfully,
        originalHash: submission.fileHash,
        decryptedHash
      },
      file: decryptedSuccessfully
        ? {
            fileName: submission.originalFileName,
            mimeType: submission.mimeType || "application/octet-stream",
            contentBase64: decryptedFile.toString("base64")
          }
        : null,
      submission
    });
  } catch (error) {
    await createAuditLog({
      user: req.user?._id,
      action: "SUBMISSION_DECRYPTED",
      resourceType: "Submission",
      resourceId: req.params.id,
      status: "failure",
      details: error.message,
      ipAddress: req.ip
    });

    res.status(error.statusCode || 500).json({
      message: "Failed to decrypt submission",
      error: error.message
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  verifySubmission,
  decryptSubmission
};
