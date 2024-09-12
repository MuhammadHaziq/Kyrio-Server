import mongoose from "mongoose";

const featuresSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
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
    icon: {
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

module.exports = mongoose.model("features", featuresSchema);
