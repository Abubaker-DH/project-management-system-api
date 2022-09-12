const {
  Project,
  validateProject,
  validateUpdateProject,
} = require("../models/project");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const express = require("express");
const { Task } = require("../models/task");
const router = express.Router();

// NOTE: get all projects
router.get("/", auth, async (req, res) => {
  let projects;
  // INFO: admin will get all projects
  if (req.user.isAdmin) {
    projects = await Project.find()
      .populate("user", "-isAdmin")
      .populate("projectTeam.member", "-isAdmin")
      .select("-__v");
    return res.send(projects);
  }

  // INFO: user create project and one that he is their Project manager
  projects = await Project.find(
    { user: req.user._id } || { projectManager: req.user._id }
  )
    .populate("user", "_id name profileImage")
    .populate("projectTeam.member", "_id name profileImage")
    .select("-__v")
    .exec();

  res.send(projects);
});

// NOTE: add new project
router.post("/", auth, async (req, res) => {
  req.body.user = req.user._id;
  // INFO:  validate data send by user
  const { error } = validateProject(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const project = new Project({
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    projectManager: req.body.projectManager,
    projectTeam: [{ member: req.body.member }],
    user: req.user._id,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    releaseDate: req.body.releaseDate,
  });
  await project.save();

  res.status(201).send({ project, message: "Added new project seccessfully." });
});

// NOTE: update project
router.patch("/:id", [auth, validateObjectId], async (req, res) => {
  let project = await Project.findById(req.params.id);
  if (!project)
    return res.status(404).send(" The project with given ID was not found.");

  const { error } = validateUpdateProject(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // INFO: the owner or admin or project manager can update the project
  if (
    req.user._id !== project.user._id ||
    req.user.isAdmin === "false" ||
    req.user._id !== project.projectManager
  ) {
    return res.status(405).send("Method not allowed.");
  }

  let newMember = [...project.projectTeam];

  // INFO: find the member index
  const memberIndex = project.projectTeam.findIndex((cp) => {
    return cp.member === req.body.member;
  });

  // INFO: 0=> member exist -1 => not exist
  if (memberIndex >= 0) {
    // INFO: remove if the member alrady exist
    newMember = project.projectTeam.filter(
      (item) => item.member !== req.body.member
    );
    // return res.send({ message: "Team member alrady exist." });
  } else {
    // INFO: add new member to project team
    newMember.push({ member: req.body.member });
  }

  project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      projectManager: req.body.projectManager,
      projectTeam: newMember,
      status: req.body.status,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      releaseDate: req.body.releaseDate,
    },
    { new: true }
  );
  res.send({ project, message: "Project updated." });
});

// NOTE: delete one project by id
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  let project = await Project.findById(req.params.id);
  if (!project)
    return res.status(404).send(" The project with given ID was not found.");

  // INFO: the owner or admin can delete the project
  if (
    req.user._id.toString() !== project.user._id.toString() ||
    req.user.isAdmin === "false"
  ) {
    return res.status(405).send("Method not allowed.");
  }

  project = await Project.findByIdAndRemove(req.params.id);

  return res.send({ project, message: "Project deleted." });
});

// NOTE: get one project route
router.get("/:id", auth, validateObjectId, async (req, res) => {
  const project = await Project.findById(req.params.id).populate(
    "user",
    "name _id profileImage"
  );
  if (!project)
    return res.status(404).send(" The project with given ID was not found.");

  // INFO: the owner or admin or project manager can get project details
  if (
    req.user._id.toString() !== project.user._id.toString() ||
    req.user.isAdmin === "false" ||
    req.user._id.toString() !== project.projectManager.toString()
  ) {
    return res.status(405).send("Method not allowed.");
  }

  const tasks = await Task.find({ projectId: req.params.id });
  // INFO: return project with their all tasks
  res.send({ project, tasks });
});

module.exports = router;
