const winston = require("winston");
const express = require("express");
const config = require("config");
const app = express();

require("./startup/prod")(app);
require("./startup/fileUpload")(app);
require("./startup/logging")();
require("./startup/db")();
require("./startup/routes")(app);
require("./startup/config")();
require("./startup/validation")();

const port = process.env.PORT || config.get("port");
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
