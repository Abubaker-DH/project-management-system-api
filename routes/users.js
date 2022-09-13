const fs = require("fs");
const path = require("path");
const express = require("express");
const { User, validateUser } = require("../models/user");
const validateObjectId = require("../middleware/validateObjectId");
const { upload } = require("../middleware/upload");
const auth = require("../middleware/auth");
const router = express.Router();

// NOTE:  Get all users
router.get("/", auth, async (req, res) => {
  if (req.user !== "admin" || req.user !== "super-admin")
    return res.status(401).send("Access denied.");

  const users = await User.find();
  res.send(users);
});

// NOTE:  Get one user by ID
router.get("/:id", [auth, validateObjectId], async (req, res) => {
  if (req.user !== "admin" || req.user !== "super-admin")
    return res.status(401).send("Access denied.");

  const user = await User.findById(req.params.id);

  if (!user)
    return res.status(404).send("The user with given ID was not found.");

  res.send(user);
});

// NOTE:  Update User route
router.patch(
  "/:id",
  [auth, validateObjectId, upload.single("profileImage")],
  async (req, res) => {
    let user = await User.findById({ _id: req.params.id });
    if (!user)
      return res.status(404).send("The user with given ID was not found");

    // INFO: The user can not change his role
    if (req.body.role && req.user.role !== "super") {
      return res.status(403).send("Method not allowed.");
    }

    // INFO: Get the profile image from req.file
    if (req.file) {
      if (user.profileImage) clearImage(user.profileImage);
      req.body.profileImage = req.file.path;
    }

    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //  INFO: Delete the old image
    if (user.profileImage) clearImage(user.profileImage);

    // INFO: The Owner or Admin can Update
    if (
      req.user._id.toString() === req.params.id.toString() ||
      req.user.role === "admin"
    ) {
      user = await User.findByIdAndUpdate(
        { _id: req.params.id },
        {
          name: req.body.name,
          role: req.body.role,
          profileImage: req.body.profileImage,
        },
        { new: true }
      );
      res.send(user);
    } else {
      return res.status(403).send("Method not allowed.");
    }
  }
);

// NOTE:  Delete one User By ID
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  // INFO: The super admin is allowed to delete a user
  if (req.user.role !== "super-admin") {
    return res.status(403).send("Method not allowed.");
  }

  const user = await User.findByIdAndRemove({
    _id: req.params.id,
  });

  if (!user)
    return res.status(404).send("The User with given ID was not found.");

  if (user.profileImage) {
    clearImage(user.profileImage);
  }
  res.send(user);
});

// NOTE: delete profile image from images Folder
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    return err;
  });
};

module.exports = router;
