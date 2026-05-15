const multer = require("multer");

const upload = multer({ dest: process.env.UPLOAD_DIR || "../storage/uploads" });

module.exports = upload;
