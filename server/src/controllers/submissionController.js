const path = require("path");
const fs = require("fs/promises");
const Submission = require("../models/Submission");
const User = require("../models/User");
const {
  hashBuffer,
  signHash,
  encryptFileBuffer,
  encryptSessionKey
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

const verifySubmission = async (req, res) => {
  res.status(501).json({ message: "Submission verification controller not implemented yet" });
};

const decryptSubmission = async (req, res) => {
  res.status(501).json({ message: "Submission decryption controller not implemented yet" });
};

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  verifySubmission,
  decryptSubmission
};
