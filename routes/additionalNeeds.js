const express = require("express");
const {
  AdditionalNeed,
  validateAdditionalNeed,
} = require("../models/additionalNeed");
const { Task } = require("../models/task");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

// NOTE: Add new additional Need
router.post("/", auth, async (req, res) => {
  req.body.user = req.user._id;
  // INFO:  validate data send by user
  const { error } = validateAdditionalNeed(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const task = await Task.findById(req.body.taskId);
  if (!task)
    return res.status(404).send("The task with given ID was not found.");

  const session = await mongoose.startSession();
  session.startTransaction();

  const additionalNeed = new AdditionalNeed({
    title: req.body.title,
    taskId: req.body.taskId,
    user: req.user._id,
  });
  try {
    await additionalNeed.save(session);
    task.additionalNeeds.push({ adNeed: additionalNeed._id });
    task.save(session);
    res.status(201).send({
      additionalNeed,
      message: "Added seccessfully.",
    });
  } catch (error) {
    console.log("Error occur While create new Order", error);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
});

// NOTE: Delete one additional Need by id
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  let additionalNeed = await AdditionalNeed.findById(req.params.id);
  if (!additionalNeed)
    return res
      .status(404)
      .send("The additional need with given ID was not found.");

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
    message: "Additional need deleted.",
  });
});

module.exports = router;
