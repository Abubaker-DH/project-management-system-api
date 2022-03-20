const fs = require("fs");
const path = require("path");
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
router.get("/:id", [auth, validateObjectId], async (req, res) => {
  let user;
  if (req.user.isAdmin) {
    user = await User.findById(req.params.id);
  } else {
    user = await User.findById(req.params.id).select("-isAdmin -password");
  }
  if (!user)
    return res.status(404).send("The user with given ID was not found.");

  res.send(user);
});

// NOTE:  update user route
router.patch("/:id", [auth, validateObjectId], async (req, res) => {
  let user = await User.findById({ _id: req.params.id });
  if (!user)
    return res.status(404).send("The user with given ID was not found");

  // INFO:  the owner or admin can update
  if (req.user._id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).send("method not allowed.");
  }

  // INFO: the user can not change his account to be ADMIN
  if (req.body.isAdmin === "true" && !req.user.isAdmin) {
    return res.status(403).send("method not allowed.");
  }

  // INFO: get the profile image from req.file
  if (req.file) {
    req.body.profileImage = req.file.path;
  }

  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //  INFO: delete the old image
  if (req.body.profileImage || req.body.profileImage === "")
    clearImage(user.profileImage);

  user = await User.findByIdAndUpdate(
    { _id: req.params.id, isAdmin: false },
    {
      name: req.body.name,
      profileImage: req.body.profileImage,
      password: req.body.password,
      isAdmin: req.body.isAdmin,
      role: req.body.role,
    },
    { new: true }
  );

  res.send({ user, message: "User updated." });
});

// NOTE:  Delete one User By ID
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const user = await User.findByIdAndRemove({
    _id: req.params.id,
    isAdmin: false,
  });

  if (user.profileImage) {
    clearImage(user.profileImage);
  }

  if (!user)
    return res.status(404).send("The user with given ID was not found.");

  res.send({ user, message: "User deleted." });
});

// NOTE: delete profile image from images Folder
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    return err;
  });
};

module.exports = router;
