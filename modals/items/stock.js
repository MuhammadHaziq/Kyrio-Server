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
StockSchema.index(
  {
    stockTitle: 1,
  },
  {
    unique: true,
  }
);
module.exports = mongoose.model("stcoks", StockSchema);
