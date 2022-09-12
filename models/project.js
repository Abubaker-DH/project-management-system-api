const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    status: { type: String, trim: true },
    projectManager: { type: Schema.Types.ObjectId, ref: "User" },
    projectTeam: [{ member: { type: Schema.Types.ObjectId, ref: "User" } }],
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
    projectTasks: [
      {
        task: { type: Schema.Types.ObjectId, ref: "Task" },
      },
    ],
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
    projectTeam: Joi.array().items(Joi.object({ member: Joi.string() })),
  });

  return schema.validate(project);
}

function validateUpdateProject(project) {
  const schema = Joi.object({
    status: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    projectManager: Joi.objectId(),
    releaseDate: Joi.date(),
    title: Joi.string().min(5).max(50),
    description: Joi.string().min(5).max(50),
    projectTeam: Joi.array().items(Joi.object({ member: Joi.string() })),
  });

  return schema.validate(project);
}

module.exports.Project = mongoose.model("Project", projectSchema);
exports.validateProject = validateProject;
module.exports.projectSchema = projectSchema;
exports.validateUpdateProject = validateUpdateProject;
