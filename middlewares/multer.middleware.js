const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Ensure temp directory exists
const tempDir = path.join(__dirname, "../public/temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, tempDir);
    },
    filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
    },
});

// Export the multer instance
const upload = multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB limit 
    },
});

module.exports = { upload };