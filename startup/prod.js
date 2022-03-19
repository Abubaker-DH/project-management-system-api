const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");

module.exports = function (app) {
  app.use(cors());
  app.use(helmet());
  app.use(compression());
};
