const multer = require("multer");

const storage = (destinationFolder, timestamp) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destinationFolder); // Dynamic destination folder for storing images
    },
    filename: function (req, file, cb) {
      const filename = `${timestamp}_${file.originalname}`;
      cb(null, filename);
      console.log("FILENAME", filename);
    },
  });
};

const configureMulter = (destinationFolder, timestamp) =>
  multer({ storage: storage(destinationFolder, timestamp) });

module.exports = configureMulter;
