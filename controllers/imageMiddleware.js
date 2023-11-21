const multer = require('multer');
const path = require('path');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg']; // Add image extensions
const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv']; // Add video extensions
const fs = require('fs');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // Ensure the 'uploads' directory exists
      fs.mkdirSync('./uploads', { recursive: true });
      cb(null, path.join('./uploads'));
    } catch (error) {
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();

  if (imageExtensions.includes(extname) || videoExtensions.includes(extname)) {
    return cb(null, true); // Accept the file
  }

  const error = new Error('File type not allowed.');
  error.code = 'LIMIT_FILE_TYPES';
  return cb(error, false);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
