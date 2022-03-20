const config = require("config");

module.exports = function () {
  if (!config.get("jwtPrivateKey") && !process.env.jwtPrivateKey) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }
};
