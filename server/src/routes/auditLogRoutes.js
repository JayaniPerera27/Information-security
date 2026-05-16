const express = require("express");
const { getAuditLogs } = require("../controllers/auditLogController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authenticate, authorizeRoles("admin"), getAuditLogs);

module.exports = router;
