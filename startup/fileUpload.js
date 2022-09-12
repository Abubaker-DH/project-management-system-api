const path = require("path");
const express = require("express");

module.exports = function (app) {
  // INFO: path for ststic file
  app.use("/images", express.static(path.join(__dirname, "images")));
};
