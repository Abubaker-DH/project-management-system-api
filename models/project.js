const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    status: { type: String, trim: true },
    projectManager: { type: Schema.Types.ObjectId, ref: "User" },
    projectTeam: [{ memper: { type: Schema.Types.ObjectId, ref: "User" } }],
    description: { type: String },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    releaseDate: {
      type: Date,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

function validateProject(project) {
  const schema = Joi.object({
    status: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    projectManager: Joi.objectId(),
    releaseDate: Joi.date(),
    title: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(50),
    user: Joi.objectId().required(),
    projectTeam: Joi.array()
      .allow("")
      .items(Joi.object({ item: Joi.string() })),
  });

  return schema.validate(project);
}

module.exports.Project = mongoose.model("Project", projectSchema);
exports.validateProject = validateProject;
