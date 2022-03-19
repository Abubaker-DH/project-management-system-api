const winston = require("winston");

// This middleware only catch errors that happen as part of
// request processing pipe line so it's related to express
// so any errors outside request will be ignor
module.exports = function (err, req, res, next) {
  winston.error(err.message, err);

  res.status(500).send("Something failed on server.");
};
