const User = require("../models/User");
const { generateRsaKeyPair } = require("../services/cryptoService");

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to load users", error: error.message });
  }
};

const getPublicKey = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email role publicKey");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      publicKey: user.publicKey || null
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load public key", error: error.message });
  }
};

const getPublicKeys = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role publicKey keyGeneratedAt updatedAt")
      .sort({ role: 1, name: 1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to load public keys", error: error.message });
  }
};

const getExamOfficers = async (req, res) => {
  try {
    const users = await User.find({ role: "exam_officer" })
      .select("name email role publicKey keyGeneratedAt")
      .sort({ name: 1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to load exam officers", error: error.message });
  }
};

const generateMyKeyPair = async (req, res) => {
  try {
    const { publicKey, privateKey } = generateRsaKeyPair();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        publicKey,
        keyGeneratedAt: new Date()
      },
      { new: true }
    ).select("-passwordHash");

    const { createAuditLog } = require("../services/auditService");
    await createAuditLog({
      user: req.user._id,
      action: "KEY_PAIR_GENERATED",
      resourceType: "User",
      resourceId: req.user._id.toString(),
      status: "success",
      details: "User generated a new RSA key pair; public key stored only",
      ipAddress: req.ip
    });

    res.status(201).json({
      message: "Key pair generated successfully. Store the private key securely.",
      user,
      publicKey,
      privateKey
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate key pair", error: error.message });
  }
};

const updateMyPublicKey = async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey || !publicKey.includes("BEGIN PUBLIC KEY")) {
      return res.status(400).json({ message: "A valid PEM public key is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        publicKey,
        keyGeneratedAt: new Date()
      },
      { new: true }
    ).select("-passwordHash");

    const { createAuditLog } = require("../services/auditService");
    await createAuditLog({
      user: req.user._id,
      action: "PUBLIC_KEY_UPDATED",
      resourceType: "User",
      resourceId: req.user._id.toString(),
      status: "success",
      details: "User updated their public key",
      ipAddress: req.ip
    });

    res.json({
      message: "Public key updated successfully",
      user,
      publicKey: user.publicKey
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update public key", error: error.message });
  }
};

module.exports = {
  getUsers,
  getPublicKey,
  getPublicKeys,
  getExamOfficers,
  generateMyKeyPair,
  updateMyPublicKey
};
