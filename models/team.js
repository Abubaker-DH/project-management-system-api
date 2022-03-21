const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teamSchema = new Schema(
  {
    teamMember: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
    },
  },
  { timestamps: true }
);

function validateTeam(team) {
  const schema = Joi.object({
    user: Joi.objectId().required(),
    teamMember: Joi.objectId().required(),
    role: Joi.string(),
  });

  return schema.validate(team);
}
function validateUpdateTeam(team) {
  const schema = Joi.object({
    role: Joi.string(),
  });

  return schema.validate(team);
}

module.exports.Team = mongoose.model("Team", teamSchema);
module.exports.validateTeam = validateTeam;
module.exports.validateUpdateTeam = validateUpdateTeam;
