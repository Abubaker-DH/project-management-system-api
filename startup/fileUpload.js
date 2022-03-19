const path = require("path");
const multer = require("multer");
const express = require("express");

module.exports = function (app) {
  // INFO: Setup image folder and image name OR image URL
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        new Date().toISOString().replace(/[\/\\:]/g, "-") +
          "-" +
          file.originalname
      );
    },
  });

  // INFO: Type of file that acceptaple to upload
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/PNG" ||
      file.mimetype === "image/JPG" ||
      file.mimetype === "image/JPEG"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single(
      "profileImage"
    )
  );
  app.use("/images", express.static(path.join(__dirname, "images")));
};
