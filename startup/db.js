const winston = require("winston");
const mongoose = require("mongoose");

module.exports = function () {
  const db = process.env.DB;
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => winston.info(`Connected to DB...`));
};
