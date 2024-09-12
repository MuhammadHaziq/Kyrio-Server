import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
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
    icon: {
      type: String,
      min: 3,
      max: 255,
    },
    heading: {
      type: String,
      min: 3,
      max: 255,
    },
    span: {
      type: String,
      min: 3,
      max: 255,
    },
    enable: Boolean,
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("settings", settingsSchema);
