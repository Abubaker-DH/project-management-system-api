const { Team, validateTeam, validateUpdateTeam } = require("../models/team");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const express = require("express");
const router = express.Router();

// NOTE: get all team members
router.get("/", auth, async (req, res) => {
  let teams;
  // INFO: admin will get all teams
  if (req.user.isAdmin) {
    teams = await Team.find().populate("teamMember").select("-__v");
    return res.send(teams);
  }
  // INFO: user will get their owne team
  teams = await Team.find({ user: req.user._id })
    .populate("teamMember", "_id name profileImage")
    .select("-__v");

  res.send(teams);
});

// NOTE: add new team member
router.post("/", auth, async (req, res) => {
  req.body.user = req.user._id;
  // INFO:  validate data send by user
  const { error } = validateTeam(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const member = await Team.find({ teamMember: req.body.teamMember });
  if (member) return res.send({ message: "Team member alrady exist." });

  const team = new Team({
    teamMember: req.body.teamMember,
    role: req.body.role,
    user: req.user._id,
  });
  await team.save();

  res
    .status(201)
    .send({ team, message: "Added new team member seccessfully." });
});

// NOTE: update team member
router.patch("/:id", [auth, validateObjectId], async (req, res) => {
  let team = await Team.findById(req.params.id);
  if (!team)
    return res
      .status(404)
      .send(" The team member with given ID was not found.");

  const { error } = validateUpdateTeam(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // INFO: the owner or admin can update the team
  if (req.user._id !== team.user._id && req.user.isAdmin === "false") {
    return res.status(405).send("Method not allowed.");
  }

  team = await Team.findByIdAndUpdate(
    req.params.id,
    {
      role: req.body.role,
    },
    { new: true }
  );
  res.send({ team, message: "Team member updated." });
});

// NOTE: delete one team by id
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  let team = await Team.findById(req.params.id);
  if (!team)
    return res.status(404).send("The team member with given ID was not found.");

  // INFO: the owner or admin can delete team
  if (
    req.user._id.toString() !== team.user._id.toString() &&
    req.user.isAdmin === false
  ) {
    return res.status(405).send("Method not allowed.");
  }

  team = await Team.findByIdAndRemove(req.params.id);
  if (!team)
    return res
      .status(404)
      .send(" The team member with given ID was not found.");

  return res.send({ team, message: "Team member deleted." });
});

// NOTE: get one team member route
router.get("/:id", auth, validateObjectId, async (req, res) => {
  const team = await Team.findById(req.params.id).populate(
    "teamMember",
    "name _id profileImage role"
  );
  if (!team)
    return res
      .status(404)
      .send(" The team member with given ID was not found.");

  res.send(team);
});

module.exports = router;
