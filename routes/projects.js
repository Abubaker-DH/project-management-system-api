const { Project, validateProject } = require("../models/project");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const express = require("express");
const router = express.Router();

// NOTE: get all projects
router.get("/", auth, async (req, res) => {
  let projects;
  // INFO: admin will get all projects
  if (req.user.isAdmin) {
    projects = await Project.find().populate("user").select("-__v");
  } else {
    // INFO: user will get their owne project
    projects = await Project.find(req.user._id.toString() === project.user._id)
      .populate("user", "_id name imageUrl")
      .select("-__v");
  }

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
    state: req.body.state,
    user: req.user._id,
  });
  await project.save();

  res.status(201).send({ project, message: "Added new project seccessfully." });
});

// NOTE: update project
router.put("/:id", [auth, validateObjectId], async (req, res) => {
  const { error } = validateProject(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let project = await Project.findById(req.params.id);
  if (!project)
    return res.status(404).send(" The project with given ID was not found.");

  // INFO: the owner or admin can update the project
  if (
    req.user._id.toString() !== project.user.toString() ||
    req.user.isAdmin === "false"
  ) {
    return res.status(405).send("Method not allowed.");
  }

  project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      state: req.body.state,
      user: req.user._id,
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

  // INFO: the owner or admin can delete the project
  if (req.user._id.toString() === project.user.toString() || req.user.isAdmin) {
    clearImage(project.images);
    await Project.findByIdAndRemove(req.params.id);
    return res.send({ project: project, message: "Project deleted." });
  }
  return res.status(405).send("Method not allowed.");
});

// NOTE: get one project route
router.get("/:id", auth, validateObjectId, async (req, res) => {
  const project = await Project.findById(req.params.id).populate(
    "user",
    "name _id"
  );
  if (!project)
    return res.status(404).send(" The project with given ID was not found.");

  res.send(project);
});

module.exports = router;
