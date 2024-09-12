import mongoose, { mongo, models } from "mongoose";

const taxesTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

taxesTypeSchema.index(
  {
    title: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("taxesType", taxesTypeSchema);
