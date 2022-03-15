const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    state: { type: String },
    title: { type: String, required: true },
    description: { type: String },
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
    state: Joi.string(),
    title: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(50),
    user: Joi.objectId().required(),
  });

  return schema.validate(project);
}

module.exports.Project = mongoose.model("Project", projectSchema);
exports.validateProject = validateProject;
exports.projectSchema = projectSchema;
