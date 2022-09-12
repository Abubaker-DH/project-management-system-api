const { Team, validateTeam } = require("../models/team");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const express = require("express");
const router = express.Router();

// NOTE: Get all team members
router.get("/", auth, async (req, res) => {
  let teams;
  // INFO: admin will get all teams
  if (req.user.role === "admin") {
    teams = await Team.find()
      .populate("user", "_id name email profileImage")
      .populate("teamMembers.member")
      .select("-__v");
    return res.send(teams);
  }

  // INFO: User will get their Owne team
  teams = await Team.find({ user: req.user._id })
    .populate("teamMembers.member", "_id email name profileImage")
    .select("-__v");

  res.send(teams);
});

// NOTE: add new team member
router.post("/", auth, async (req, res) => {
  req.body.user = req.user._id;
  // INFO:  validate data send by user
  const { error } = validateTeam(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const team = new Team({
    teamMembers: req.body.teamMembers,
    title: req.body.title,
    user: req.user._id,
  });
  await team.save();

  res
    .status(201)
    .send({ team, message: "Added new team member seccessfully." });
});

// NOTE: Update team member
router.patch("/:id", [auth, validateObjectId], async (req, res) => {
  let team = await Team.findById(req.params.id);
  if (!team)
    return res.status(404).send(" The team with given ID was not found.");

  const { error } = validateTeam(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // INFO: remove duplicate members
  let membersArray = [];
  req.body.teamMembers.forEach((element) => {
    if (!membersArray.includes(element)) {
      membersArray.push(element);
    }
  });

  team = await Team.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      teamMembers: membersArray,
    },
    { new: true }
  );
  res.send({ team, message: "Team member updated." });
});

// NOTE: Delete one team by id
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team)
    return res.status(404).send(" The team with given ID was not found.");

  // INFO: the Owner or Admin Can get team details
  if (
    req.user._id.toString() !== team.user._id.toString() ||
    req.user.role !== "admin"
  )
    return res.status(405).send("Method not allowed.");

  await Team.findByIdAndRemove(req.params.id);

  return res.send({ team, message: "Team member deleted." });
});

// NOTE: Get one team with members route
router.get("/:id", auth, validateObjectId, async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team)
    return res.status(404).send(" The team with given ID was not found.");

  // INFO: the Owner or Admin Can get team details
  if (
    req.user._id.toString() !== team.user._id.toString() ||
    req.user.role !== "admin"
  )
    return res.status(405).send("Method not allowed.");

  await Team.findById(req.params.id)
    .populate("user", "name profileImage email")
    .populate("teamMembers.member", "name profileImage email job");

  res.send(team);
});

module.exports = router;
