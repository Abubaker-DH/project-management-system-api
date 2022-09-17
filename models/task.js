const mongoose = require("mongoose");
const { additionalNeedSchema } = require("./additionalNeed");
const Joi = require("joi");

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
      { adNeed: { type: Schema.Types.ObjectId, ref: "AdditionalNeed" } },
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

taskSchema.pre("remove", function (next) {
  additionalNeedSchema.remove({ taskId: this._id }).exec();
  next();
});

function validateTask(task) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    projectId: Joi.objectId().required(),
    assignee: Joi.objectId(),
    user: Joi.objectId(),
    additionalNeed: Joi.array().items(Joi.object({ adNeed: Joi.string() })),
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
    assignee: Joi.objectId(),
    status: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    additionalNeed: Joi.array().items(Joi.object({ adNeed: Joi.string() })),
  });

  return schema.validate(task);
}

module.exports.Task = mongoose.model("Task", taskSchema);
module.exports.validateUpdateTask = validateUpdateTask;
module.exports.validateTask = validateTask;
module.exports.taskSchema = taskSchema;
