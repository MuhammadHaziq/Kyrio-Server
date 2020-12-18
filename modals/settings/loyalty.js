import mongoose, { mongo, models } from "mongoose";

const loyaltySchema = new mongoose.Schema({
  amount: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  storeId: {
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

module.exports = mongoose.model("settingsLoyalty", loyaltySchema);
