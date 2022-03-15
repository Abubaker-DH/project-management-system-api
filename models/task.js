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
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    additionalNeed: {
      type: String,
      maxlength: 255,
    },
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
  const schema = {
    title: Joi.string().min(3).max(50).required(),
    projectId: Joi.objectId(),
    userId: Joi.objectId(),
    priority: Joi.string(),
    status: Joi.string(),
    additionalNeed: Joi.string(),
  };

  return Joi.validate(task, schema);
}

module.exports.Task = mongoose.model("Task", taskSchema);
module.exports.validate = validateTask;
