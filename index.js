// const winston = require("winston");
const express = require("express");
// const config = require("config");
const app = express();

// require("./startup/cors")(app);
// require("./startup/prod")(app);
// require("./startup/fileUpload")(app);
// require("./startup/logging")();
// require("./startup/db")();
// require("./startup/routes")(app);
// require("./startup/config")();
// require("./startup/validation")();
app.get("/", (req, res, next) => {
  res.send("Hello to Project Management System Api");
});

const port = process.env.PORT || 3000;
// NOTE: config.get("port")
const server = app.listen(port, () =>
  // winston.info(`Listening on port ${port}...`)
  console.log(`Listening on port ${port}...`)
);

module.exports = server;
