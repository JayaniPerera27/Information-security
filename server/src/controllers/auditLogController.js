const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Failed to load audit logs", error: error.message });
  }
};

module.exports = { getAuditLogs };
