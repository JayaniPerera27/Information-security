const express = require("express");
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  verifySubmission,
  decryptSubmission
} = require("../controllers/submissionController");

const router = express.Router();

router.post("/", createSubmission);
router.get("/", getSubmissions);
router.get("/:id", getSubmissionById);
router.post("/:id/verify", verifySubmission);
router.post("/:id/decrypt", decryptSubmission);

module.exports = router;
