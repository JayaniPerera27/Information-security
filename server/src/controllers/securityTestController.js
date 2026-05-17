const fs = require("fs/promises");
const Submission = require("../models/Submission");
const { createAuditLog } = require("../services/auditService");

const getAllSubmissionsForTesting = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("lecturer", "name email role")
      .populate("examOfficer", "name email role")
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: "Failed to load test submissions", error: error.message });
  }
};

const tamperSignature = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.digitalSignature = `${submission.digitalSignature.slice(0, -4)}AAAA`;
    submission.status = "submitted";
    await submission.save();

    await createAuditLog({
      user: req.user._id,
      action: "SECURITY_TEST_SIGNATURE_TAMPERED",
      resourceType: "Submission",
      resourceId: submission._id.toString(),
      status: "success",
      details: "Admin simulated modified signature attack",
      ipAddress: req.ip
    });

    res.json({
      message: "Signature modified for testing. Verification should now fail.",
      expectedResult: "Modified signature fails verification"
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to tamper signature", error: error.message });
  }
};

const tamperEncryptedFile = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const encryptedFile = await fs.readFile(submission.encryptedFilePath);

    if (encryptedFile.length === 0) {
      return res.status(400).json({ message: "Encrypted file is empty" });
    }

    encryptedFile[0] = encryptedFile[0] ^ 0xff;
    await fs.writeFile(submission.encryptedFilePath, encryptedFile);

    submission.status = "submitted";
    await submission.save();

    await createAuditLog({
      user: req.user._id,
      action: "SECURITY_TEST_ENCRYPTED_FILE_TAMPERED",
      resourceType: "Submission",
      resourceId: submission._id.toString(),
      status: "success",
      details: "Admin simulated modified encrypted file attack",
      ipAddress: req.ip
    });

    res.json({
      message: "Encrypted file modified for testing. Decryption should now fail.",
      expectedResult: "Modified encrypted file is rejected by AES-GCM authentication"
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to tamper encrypted file", error: error.message });
  }
};

const simulateReplay = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.replayCheckCount += 1;
    submission.lastReplayCheckAt = new Date();
    await submission.save();

    await createAuditLog({
      user: req.user._id,
      action: "SECURITY_TEST_REPLAY_DETECTED",
      resourceType: "Submission",
      resourceId: submission._id.toString(),
      status: "failure",
      details: `Replay simulation detected existing submission code ${submission.submissionCode || submission._id}`,
      ipAddress: req.ip
    });

    res.json({
      message: "Replay detected. The submission ID/code already exists in the database.",
      result: {
        replayDetected: true,
        submissionCode: submission.submissionCode || submission._id,
        replayCheckCount: submission.replayCheckCount,
        timestamp: submission.lastReplayCheckAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to simulate replay", error: error.message });
  }
};

const getSecurityChecklist = (req, res) => {
  res.json({
    normalTests: [
      "Lecturer logs in successfully",
      "Lecturer uploads paper",
      "Paper is encrypted and metadata is stored",
      "Exam officer receives assigned paper",
      "Signature verification succeeds",
      "Paper decrypts successfully"
    ],
    attackTests: [
      "Wrong user tries to access paper and receives 403",
      "Modified encrypted file is rejected",
      "Modified signature fails verification",
      "Wrong private key cannot decrypt paper",
      "Invalid login fails",
      "Replayed old submission is detected using submission code"
    ]
  });
};

module.exports = {
  getAllSubmissionsForTesting,
  tamperSignature,
  tamperEncryptedFile,
  simulateReplay,
  getSecurityChecklist
};
