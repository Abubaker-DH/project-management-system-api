const { Team, validateTeam } = require("../models/team");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const express = require("express");
const router = express.Router();

// NOTE: get all teams
router.get("/", auth, async (req, res) => {
  let teams;
  // INFO: admin will get all teams
  if (req.user.isAdmin) {
    teams = await Team.find().populate("teamMember").select("-__v");
  } else {
    // INFO: user will get their owne team
    teams = await Team.find(req.user._id.toString() === team.user.toString())
      .populate("teamMember", "_id name imageUrl")
      .select("-__v");
  }

  res.send(teams);
});

// NOTE: add new team
router.post("/", auth, async (req, res) => {
  // INFO:  validate data send by user
  const { error } = validateTeam(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const team = new Team({
    teamMember: req.body.teamMember,
    role: req.body.role,
    user: req.user._id,
  });
  await team.save();

  res.status(201).send({ team, message: "Added new team seccessfully." });
});

// NOTE: update team
router.put("/:id", [auth, validateObjectId], async (req, res) => {
  const { error } = validateTeam(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let team = await Team.findById(req.params.id);
  if (!team)
    return res.status(404).send(" The team with given ID was not found.");

  // INFO: the owner or admin can update the team
  if (
    req.user._id.toString() !== team.user.toString() ||
    req.user.isAdmin === "false"
  ) {
    return res.status(405).send("Method not allowed.");
  }

  team = await Team.findByIdAndUpdate(
    req.params.id,
    {
      role: req.body.role,

      user: req.user._id,

      teamMember: req.body.teamMember,
    },
    { new: true }
  );
  res.send({ team, message: "Team updated." });
});

// NOTE: delete one team by id
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  // INFO: the owner or admin can delete team
  if (req.user._id.toString() === team.user.toString() || req.user.isAdmin) {
    return res.status(405).send("Method not allowed.");
  }

  const team = await Team.findByIdAndRemove(req.params.id);
  if (!team)
    return res.status(404).send(" The team with given ID was not found.");

  return res.send({ team, message: "Team deleted." });
});

// NOTE: get one team route
router.get("/:id", auth, validateObjectId, async (req, res) => {
  const team = await Team.findById(req.params.id).populate(
    "teamMember",
    "name _id imageUrl role"
  );
  if (!team)
    return res.status(404).send(" The team with given ID was not found.");

  res.send(team);
});

module.exports = router;
