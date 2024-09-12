import mongoose, { mongo, models } from "mongoose";

const loyaltySchema = new mongoose.Schema(
  {
    amount: {
      type: String,
      default: "00.00",
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
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("loyalties", loyaltySchema);
