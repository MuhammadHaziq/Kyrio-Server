import mongoose from "mongoose";

const skuHistorySchema = new mongoose.Schema({
  sku: {
    type: String,
    min: 5,
    max: 40,
    required: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
},{
  timestamps: true
});

module.exports = mongoose.model("skuHistory", skuHistorySchema);
