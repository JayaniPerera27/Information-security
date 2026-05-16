const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  verifySubmission,
  decryptSubmission
} = require("../controllers/submissionController");

const router = express.Router();

router.use(authenticate);

router.post("/", authorizeRoles("lecturer"), upload.single("paper"), createSubmission);
router.get("/", authorizeRoles("lecturer", "exam_officer"), getSubmissions);
router.get("/:id", authorizeRoles("lecturer", "exam_officer"), getSubmissionById);
router.post("/:id/verify", authorizeRoles("exam_officer"), verifySubmission);
router.post("/:id/decrypt", authorizeRoles("exam_officer"), decryptSubmission);

module.exports = router;
