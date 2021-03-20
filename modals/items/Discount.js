import mongoose from "mongoose";

const DiscountSchema = new mongoose.Schema({
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
  type: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  value: {
    type: Number,
    max: 100000000000,
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
  created_at: {
    type: Date,
    default: Date.now(),
  },
  created_by: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
  deleted: {
    type: Number,
    max: 1,
    default: 0
  },
  deleted_at: {
      type: Date,
      default: Date.now(),
  },
});

module.exports = mongoose.model("discount", DiscountSchema);
