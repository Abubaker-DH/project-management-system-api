const { Task, validateTask } = require("../models/task");
const { Project } = require("../models/project");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const express = require("express");
const router = express.Router();

// NOTE: get all tasks
router.get("/", auth, async (req, res) => {
  let tasks;
  // INFO: admin will get all tasks
  if (req.user.isAdmin) {
    tasks = await Task.find().populate("user").select("-__v");
  } else {
    // INFO: user will get their owne task
    tasks = await Task.find({ user: req.user._id })
      .populate("user", "_id name profileImage")
      .select("-__v");
  }

  res.send(tasks);
});

// NOTE: add new task
router.post("/", auth, async (req, res) => {
  // INFO:  validate data send by user
  const { error } = validateTask(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const task = new Task({
    title: req.body.title,
    projectId: req.body.projectId,
    description: req.body.description,
    additionalNeed: req.body.additionalNeed,
    status: req.body.status,
    user: req.user._id,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    releaseDate: req.body.releaseDate,
  });
  await task.save();

  res.status(201).send({ task, message: "Added new task seccessfully." });
});

// NOTE: update task
router.patch("/:id", [auth, validateObjectId], async (req, res) => {
  const { error } = validateTask(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let task = await Task.findById(req.params.id);
  if (!task)
    return res.status(404).send(" The task with given ID was not found.");

  const project = await Project.findById(task.projectId);

  // INFO: the owner, admin or project manager can update the task
  if (
    req.user._id !== task.user._id &&
    req.user.isAdmin === "false" &&
    req.user._id !== project.projectManager
  ) {
    return res.status(405).send("Method not allowed.");
  }

  task = await Task.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      additionalNeed: req.body.additionalNeed,
      // user: req.user._id,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      releaseDate: req.body.releaseDate,
      projectId: req.body.projectId,
    },
    { new: true }
  );
  res.send({ task, message: "Task updated." });
});

// NOTE: delete one task by id
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  let task = await Task.findById(req.params.id);
  if (!task)
    return res.status(404).send(" The task with given ID was not found.");

  const project = await Project.findById(task.projectId);

  // INFO: the owner, admin or project manager can delete task
  if (
    req.user._id.toString() !== task.user._id.toString() &&
    req.user.isAdmin === "false" &&
    req.user._id !== project.projectManager
  ) {
    return res.status(405).send("Method not allowed.");
  }

  task = await Task.findByIdAndRemove(req.params.id);

  return res.send({ task, message: "Task deleted." });
});

// NOTE: get one task route
router.get("/:id", auth, validateObjectId, async (req, res) => {
  const task = await Task.findById(req.params.id).populate(
    "user",
    "name _id profileImage"
  );
  if (!task)
    return res.status(404).send(" The task with given ID was not found.");

  res.send(task);
});

module.exports = router;
