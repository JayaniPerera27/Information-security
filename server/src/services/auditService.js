const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({ user, action, resourceType, resourceId, status, details, ipAddress }) => {
  try {
    await AuditLog.create({
      user,
      action,
      resourceType,
      resourceId,
      status,
      details,
      ipAddress
    });
  } catch (error) {
    console.error("Audit log creation failed:", error.message);
  }
};

module.exports = { createAuditLog };
