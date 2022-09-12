const mongoose = require("mongoose");
const Joi = require("joi");

const Schema = mongoose.Schema;

const additionalNeedSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

function validateAdditionalNeed(additionalNeed) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    taskId: Joi.objectId().required(),
  });

  return schema.validate(additionalNeed);
}

module.exports.AdditionalNeed = mongoose.model(
  "AdditionalNeed",
  additionalNeedSchema
);
module.exports.additionalNeedSchema = additionalNeedSchema;
module.exports.validateAdditionalNeed = validateAdditionalNeed;
