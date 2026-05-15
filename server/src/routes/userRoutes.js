const express = require("express");
const { getUsers, getPublicKey } = require("../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id/public-key", getPublicKey);

module.exports = router;
