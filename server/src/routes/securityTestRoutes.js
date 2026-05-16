const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getAllSubmissionsForTesting,
  tamperSignature,
  tamperEncryptedFile,
  simulateReplay,
  getSecurityChecklist
} = require("../controllers/securityTestController");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("admin"));

router.get("/checklist", getSecurityChecklist);
router.get("/submissions", getAllSubmissionsForTesting);
router.post("/submissions/:id/tamper-signature", tamperSignature);
router.post("/submissions/:id/tamper-encrypted-file", tamperEncryptedFile);
router.post("/submissions/:id/replay", simulateReplay);

module.exports = router;
