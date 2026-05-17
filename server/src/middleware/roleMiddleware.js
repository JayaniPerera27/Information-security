const { createAuditLog } = require("../services/auditService");

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication is required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      await createAuditLog({
        user: req.user._id,
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        resourceType: "Route",
        status: "failure",
        details: `${req.user.role} attempted ${req.method} ${req.originalUrl}; allowed roles: ${allowedRoles.join(", ")}`,
        ipAddress: req.ip
      });

      return res.status(403).json({ message: "You do not have permission to access this resource" });
    }

    next();
  };
};

module.exports = authorizeRoles;
