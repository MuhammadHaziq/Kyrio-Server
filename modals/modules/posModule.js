import mongoose from "mongoose";

const posModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    handle: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    description: {
      type: String,
      min: 3,
      max: 255,
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("posModule", posModuleSchema);
