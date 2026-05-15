const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    courseCode: { type: String, required: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    examOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    encryptedFilePath: { type: String, required: true },
    encryptedSessionKey: { type: String, required: true },
    fileHash: { type: String, required: true },
    digitalSignature: { type: String, required: true },
    authTag: { type: String, required: true },
    iv: { type: String, required: true },
    status: {
      type: String,
      enum: ["submitted", "verified", "rejected", "decrypted"],
      default: "submitted"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
