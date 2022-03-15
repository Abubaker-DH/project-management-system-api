const mongoose = require("mongoose");

// NOTE: check if the id is valid or not
module.exports = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send("Invalid ID.");

  next();
};
