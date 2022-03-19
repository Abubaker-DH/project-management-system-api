const config = require("config");
const winston = require("winston");
require("express-async-errors");

// INFO:  the best parctes is to exst(1) or end the process and restarted with clean state
module.exports = function () {
  /* INFO: when we have an exception in the node process but no ware
   we have handle that exception using Catch block  (handle node exception) */
  winston.exceptions.handle(
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  // INFO: (handle promise exception)
  const logger = winston.createLogger({
    rejectionHandlers: [
      new winston.transports.File({ filename: "rejectionExceptions.log" }),
    ],
  });

  // INFO: this is a default logger
  winston.add(new winston.transports.File({ filename: "logfile.log" }));
};
