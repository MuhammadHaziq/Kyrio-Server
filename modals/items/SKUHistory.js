import mongoose from "mongoose";

const skuHistorySchema = new mongoose.Schema({
  sku: {
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
});

module.exports = mongoose.model("skuHistory", skuHistorySchema);
