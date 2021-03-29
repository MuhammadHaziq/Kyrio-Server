import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  stockTitle: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255,
    required: true,
  },
  deleted: {
    type: Number,
    max: 1,
    default: 0,
  },
  deleted_at: {
    type: Date,
    default: Date.now(),
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
StockSchema.index(
  {
    stockTitle: 1,
  },
  {
    unique: true,
  }
);
module.exports = mongoose.model("stcoks", StockSchema);
