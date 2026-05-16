const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createAuditLog } = require("../services/auditService");

const allowedRoles = ["admin", "lecturer", "exam_officer"];

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "development_secret_change_me",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  publicKey: user.publicKey || null
});

const register = async (req, res) => {
  try {
    const { name, email, password, role, publicKey } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid user role" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      publicKey
    });

    const token = createToken(user);

    await createAuditLog({
      user: user._id,
      action: "USER_REGISTERED",
      resourceType: "User",
      resourceId: user._id.toString(),
      status: "success",
      details: `Registered ${role} account for ${normalizedEmail}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: formatUser(user)
    });
  } catch (error) {
    await createAuditLog({
      action: "USER_REGISTERED",
      resourceType: "User",
      status: "failure",
      details: error.message,
      ipAddress: req.ip
    });

    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      await createAuditLog({
        action: "USER_LOGIN_FAILED",
        resourceType: "User",
        status: "failure",
        details: `Failed login for unknown email ${email.toLowerCase().trim()}`,
        ipAddress: req.ip
      });

      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await createAuditLog({
        user: user._id,
        action: "USER_LOGIN_FAILED",
        resourceType: "User",
        resourceId: user._id.toString(),
        status: "failure",
        details: `Failed login for ${user.email}`,
        ipAddress: req.ip
      });

      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user);

    await createAuditLog({
      user: user._id,
      action: "USER_LOGGED_IN",
      resourceType: "User",
      resourceId: user._id.toString(),
      status: "success",
      details: `Login successful for ${user.email}`,
      ipAddress: req.ip
    });

    res.json({
      message: "Login successful",
      token,
      user: formatUser(user)
    });
  } catch (error) {
    await createAuditLog({
      action: "USER_LOGIN_FAILED",
      resourceType: "User",
      status: "failure",
      details: error.message,
      ipAddress: req.ip
    });

    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

module.exports = { register, login, getCurrentUser };
