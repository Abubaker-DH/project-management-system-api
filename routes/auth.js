const express = require("express");
const bcrypt = require("bcryptjs");
const lodash = require("lodash");
const { User, validateRegister, validateLogin } = require("../models/user");

const router = express.Router();

// INFO: SignUp or register or crate user route
router.post("/register", async (req, res, next) => {
  // NOTE: check if the user send all the data
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registerd..");

  user = new User(lodash.pick(req.body, ["name", "email", "password"]));
  // NOTE: hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  // generate token
  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .status(201)
    .send(lodash.pick(user, ["_id", "name", "email", "profileImage"]));
});

// INFO: Login or signIn route
router.post("/login", async (req, res, next) => {
  // NOTE: check if the user send all the data
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password..");

  const isMatch = await user.matchPassword(req.body.password);
  if (!isMatch) return res.status(400).send("Invalid email or password..");

  // NOTE: generate token
  const token = user.generateAuthToken();

  res.send(token);
});

module.exports = router;
