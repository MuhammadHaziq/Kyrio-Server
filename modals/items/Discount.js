import mongoose from "mongoose";

const DiscountSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  type: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  value: {
    type: Number,

    max: 100000000000,
    required: true,
  },
  restricted: {
    type: Boolean,
    min: 3,
    max: 255,
    required: true,
  },
  stores: [
    {
      id: {
        type: String,
        min: 1,
        max: 255,
      },
      title: {
        type: String,
        min: 1,
        max: 255,
      },
    },
  ],
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

module.exports = mongoose.model("discount", DiscountSchema);
