const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 10,
    },
    imageUrl: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 1024,
    },
    isAdmin: { type: Boolean, default: false },
    roll: { type: String },
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      roll: this.roll,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

// FIXME:
function validateUser(user) {
  const schema = {
    name: Joi.string().min(4).max(10).required(),
    email: Joi.string().min(8).max(255).required().email(),
    password: Joi.string().min(6).max(255).required(),
  };

  return schema.validate(user);
}

module.exports.User = mongoose.model("User", userSchema);
module.exports.validateUser = validateUser;
