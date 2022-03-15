const express = require("express");
const { User, validateUser } = require("../models/user");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const admin = require("../middleware/admin");
const router = express.Router();

// NOTE:  Get all users
router.get("/", [auth, admin], async (req, res) => {
  const user = await User.find();
  res.send(user);
});

// NOTE:  Get one user by ID
router.get("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send("The user with given ID was not found.");

  res.send(user);
});

// NOTE:  update user route
router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await findByIdAndUpdate(
    { _id: req.params.id, isAdmin: false },
    {
      name: req.body.name,
      email: req.body.email,
      imageUrl: req.body.imageUrl,
      password: req.body.password,
      isAdmin: req.body.isAdmin,
      roll: req.body.roll,
    },
    { new: true }
  );

  if (!user)
    return res.status(404).send("The user with given ID was not found");

  res.send(user);
});

// NOTE:  Delete one User By ID
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const user = await User.findByIdAndRemove({
    _id: req.params.id,
    isAdmin: false,
  });
  if (!user)
    return res.status(404).send("The user with given ID was not found.");

  res.send(user);
});

module.exports = router;
