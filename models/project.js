const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    status: { type: String },
    title: { type: String, required: true },
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
    releaseDate: Joi.date(),
    title: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(50),
    user: Joi.objectId().required(),
  });

  return schema.validate(project);
}

module.exports.Project = mongoose.model("Project", projectSchema);
exports.validateProject = validateProject;
