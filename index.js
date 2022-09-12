require("dotenv").config();
const winston = require("winston");
const express = require("express");
const app = express();

require("./startup/prod")(app);
require("./startup/fileUpload")(app);
require("./startup/logging")();
require("./startup/db")();
require("./startup/routes")(app);
require("./startup/validation")();

const port = process.env.PORT || 4000;
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
