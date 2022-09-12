const express = require("express");
const mongoose = require("mongoose");
const { Project } = require("../models/project");
const { Task, validateTask, validateUpdateTask } = require("../models/task");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

// NOTE: get all tasks
router.get("/", auth, async (req, res) => {
  let tasks;
  // INFO: admin will get all tasks
  if (req.user.role === "admin") {
    tasks = await Task.find().populate("user").select("-__v");
    res.send(tasks);
  } else {
    // INFO: User will get their Owne task
    tasks = await Task.find({ user: req.user._id })
      .populate("user", "_id name profileImage")
      .select("-__v");

    res.send(tasks);
  }
});

// NOTE: add new task
router.post("/", auth, async (req, res) => {
  req.body.user = req.user._id;
  // INFO:  validate data send by user
  const { error } = validateTask(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const session = await mongoose.startSession();
  session.startTransaction();

  const project = await Project.findById(req.params.projectId);

  const task = new Task({
    title: req.body.title,
    projectId: req.body.projectId,
    assignee: req.body.assignee,
    description: req.body.description,
    priority: req.body.priority,
    additionalNeed: [{ adNeed: req.body.adNeed }],
    status: req.body.status,
    user: req.user._id,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    releaseDate: req.body.releaseDate,
  });

  try {
    project.projectTasks.push({ task: task._id });
    await task.save(session);
    await project.save(session);

    res.status(201).send({ task, message: "Added new task seccessfully." });
  } catch (error) {
    console.log("Error occur While create new Order", error);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
});

// NOTE: update task
router.patch("/:id", [auth, validateObjectId], async (req, res) => {
  // INFO: the owner, admin can update the task
  if (
    req.user._id.toString() != task.user._id.toString() ||
    req.user.isAdmin === "admin"
  )
    return res.status(405).send("Method not allowed.");

  let task = await Task.findById(req.params.id);
  if (!task)
    return res.status(404).send(" The task with given ID was not found.");

  const { error } = validateUpdateTask(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  task = await Task.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      asssignee: req.body.asssignee,
      status: req.body.status,
      priority: req.body.priority,
      additionalNeed: [{ adNeed: req.body.adNeed }],
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
  // INFO: the owner, admin can delete task
  if (
    req.user._id.toString() !== task.user._id.toString() ||
    req.user.role === "admin"
  )
    return res.status(405).send("Method not allowed.");

  const task = await Task.findByIdAndRemove(req.params.id);
  if (!task)
    return res.status(404).send(" The task with given ID was not found.");

  return res.send({ task, message: "Task deleted." });
});

// NOTE: get one task route
router.get("/:id", auth, validateObjectId, async (req, res) => {
  // INFO: the owner, admin or project manager can get task details
  if (
    req.user._id.toString() !== task.user._id.toString() ||
    req.user.role === "admin"
  )
    return res.status(405).send("Method not allowed.");

  const task = await Task.findById(req.params.id).populate(
    "user",
    "name profileImage"
  );
  if (!task)
    return res.status(404).send("The task with given ID was not found.");

  res.send(task);
});

module.exports = router;
