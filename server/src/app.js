const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const securityTestRoutes = require("./routes/securityTestRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "secure-exam-paper-server" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/security-tests", securityTestRoutes);

module.exports = app;
