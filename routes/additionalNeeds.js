const {
  AdditionalNeed,
  validateAdditionalNeed,
} = require("../models/additionalNeed");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const express = require("express");
const router = express.Router();

// NOTE: add new additionalNeed adNeed
router.post("/", auth, async (req, res) => {
  req.body.user = req.user._id;
  // INFO:  validate data send by user
  const { error } = validateAdditionalNeed(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const additionalNeed = new AdditionalNeed({
    title: req.body.title,
    taskId: req.body.taskId,
    user: req.user._id,
  });
  await additionalNeed.save();

  res.status(201).send({
    additionalNeed,
    message: "Added new additionalNeed adNeed seccessfully.",
  });
});

// NOTE: delete one additionalNeed by id
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  let additionalNeed = await AdditionalNeed.findById(req.params.id);
  if (!additionalNeed)
    return res
      .status(404)
      .send("The additionalNeed adNeed with given ID was not found.");

  // INFO: the owner or admin can delete additionalNeed
  if (
    req.user._id.toString() !== additionalNeed.user._id.toString() &&
    req.user.isAdmin === false
  ) {
    return res.status(405).send("Method not allowed.");
  }

  additionalNeed = await AdditionalNeed.findByIdAndRemove(req.params.id);

  return res.send({
    additionalNeed,
    message: "AdditionalNeed adNeed deleted.",
  });
});

module.exports = router;
