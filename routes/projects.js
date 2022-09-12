const {
  Project,
  validateProject,
  validateUpdateProject,
} = require("../models/project");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const express = require("express");
const router = express.Router();

// NOTE: Get all projects
router.get("/", auth, async (req, res) => {
  let projects;
  // INFO: admin will get all projects
  if (req.user.role == "admin") {
    projects = await Project.find()
      .populate("user", "-role")
      .populate("projectTasks.task")
      .populate("projectTeam.member", "-role")
      .select("-__v");
    return res.send(projects);
  }

  // INFO: User will their owen Project manager
  projects = await Project.find({ user: req.user._id })
    .populate("user", "name profileImage")
    .populate("projectTasks.task")
    .populate("projectTeam.member", "_id name profileImage")
    .select("-__v")
    .exec();

  res.send(projects);
});

// NOTE: add new project
router.post("/", auth, async (req, res) => {
  // INFO:  validate data send by user
  const { error } = validateProject(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const project = new Project({
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    projectManager: req.body.projectManager,
    projectTeam: req.body.projectTeam,
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

  // INFO: the owner or admin or project manager can update the project
  if (
    req.user._id.toString() !== project.user._id.toString() ||
    req.user.isAdmin !== "admin"
  )
    return res.status(405).send("Method not allowed.");

  const { error } = validateUpdateProject(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //  INFO: Remove duplicate team members from the project team array.
  let team = [...new Set(req.body.projectTeam)];

  // team = req.body.projectTeam.filter((item, index) => team.indexOf(item) === index);

  // req.body.projectTeam.forEach((element) => {
  //   if (!team.includes(element)) {
  //     team.push(element);
  //   }
  // });

  project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      projectManager: req.body.projectManager,
      projectTeam: team,
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
  const project = await Project.findById(req.params.id);
  if (!project)
    return res.status(404).send(" The project with given ID was not found.");

  // INFO: the Owner or Admin can delete the project
  if (
    req.user._id.toString() !== project.user._id.toString() ||
    req.user.role !== "admin"
  )
    return res.status(405).send("Method not allowed.");

  await Project.findByIdAndRemove(req.params.id);

  return res.send({ project, message: "Project deleted." });
});

// NOTE: get one project route
router.get("/:id", auth, validateObjectId, async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("projectTasks.task")
    .populate("user", "name profileImage")
    .populate("projectTeam.member", "_id name profileImage");

  if (!project)
    return res.status(404).send(" The project with given ID was not found.");
  // INFO: the Owner or Admin Can get project details
  if (
    req.user._id.toString() !== project.user._id.toString() ||
    req.user.role !== "admin"
  )
    return res.status(405).send("Method not allowed.");

  res.send({ project });
});

module.exports = router;
