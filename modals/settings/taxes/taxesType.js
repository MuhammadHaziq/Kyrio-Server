import mongoose, { mongo, models } from "mongoose";

const taxesTypeSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
});

taxesTypeSchema.index(
  {
    title: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("taxesType", taxesTypeSchema);
