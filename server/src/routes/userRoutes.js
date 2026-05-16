const express = require("express");
const {
  getUsers,
  getPublicKey,
  getPublicKeys,
  getExamOfficers,
  generateMyKeyPair,
  updateMyPublicKey
} = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/me/key-pair", authorizeRoles("lecturer", "exam_officer"), generateMyKeyPair);
router.put("/me/public-key", authorizeRoles("lecturer", "exam_officer"), updateMyPublicKey);
router.get("/public-keys", authorizeRoles("admin"), getPublicKeys);
router.get("/exam-officers", authorizeRoles("lecturer", "admin"), getExamOfficers);
router.get("/", authorizeRoles("admin"), getUsers);
router.get("/:id/public-key", authorizeRoles("admin", "lecturer", "exam_officer"), getPublicKey);

module.exports = router;
