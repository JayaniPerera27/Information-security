const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    resourceType: { type: String },
    resourceId: { type: String },
    status: { type: String, enum: ["success", "failure"], required: true },
    details: { type: String },
    ipAddress: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
