const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createAuditLog } = require("../services/auditService");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      await createAuditLog({
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        resourceType: "Route",
        status: "failure",
        details: `Missing token for ${req.method} ${req.originalUrl}`,
        ipAddress: req.ip
      });

      return res.status(401).json({ message: "Authentication token is required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development_secret_change_me");
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      await createAuditLog({
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        resourceType: "Route",
        status: "failure",
        details: `Token user no longer exists for ${req.method} ${req.originalUrl}`,
        ipAddress: req.ip
      });

      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    await createAuditLog({
      action: "UNAUTHORIZED_ACCESS_ATTEMPT",
      resourceType: "Route",
      status: "failure",
      details: `Invalid token for ${req.method} ${req.originalUrl}`,
      ipAddress: req.ip
    });

    res.status(401).json({ message: "Invalid or expired authentication token" });
  }
};

module.exports = authenticate;
