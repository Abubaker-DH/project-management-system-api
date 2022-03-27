const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    priority: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    status: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    additionalNeed: [
      { adNeed: { type: Schema.Types.ObjectId, ref: "AditionalNeed" } },
    ],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

function validateTask(task) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    projectId: Joi.objectId().required(),
    assignee: Joi.objectId(),
    adNeed: Joi.objectId(),
    priority: Joi.string(),
    status: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
  });

  return schema.validate(task);
}

function validateUpdateTask(task) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(50),
    priority: Joi.string(),
    assignee: Joi.ObjectId(),
    status: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    adNeed: Joi.string(),
  });

  return schema.validate(task);
}

module.exports.Task = mongoose.model("Task", taskSchema);
module.exports.validateTask = validateTask;
module.exports.validateUpdateTask = validateUpdateTask;
