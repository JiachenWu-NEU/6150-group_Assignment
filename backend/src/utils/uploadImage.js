const multer = require("multer");
const path = require("path");
const fs = require("fs");

const imagesDir = path.join(__dirname, "..", "..", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const uploadProductImage = upload.single("image");

module.exports = {
  uploadProductImage,
};
