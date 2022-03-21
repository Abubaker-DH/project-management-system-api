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
    asssignee: {
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
    additionalNeed: [{ item: { type: String } }],
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
    user: Joi.objectId().required(),
    priority: Joi.string(),
    status: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    additionalNeed: Joi.array()
      .allow("")
      .items(Joi.object({ item: Joi.string() })),
  });

  return schema.validate(task);
}

function validateUpdateTask(task) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(50),
    priority: Joi.string(),
    status: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    additionalNeed: Joi.array()
      .allow("")
      .items(Joi.object({ item: Joi.string() })),
  });

  return schema.validate(task);
}

module.exports.Task = mongoose.model("Task", taskSchema);
module.exports.validateTask = validateTask;
module.exports.validateUpdateTask = validateUpdateTask;
