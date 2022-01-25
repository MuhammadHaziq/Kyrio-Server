import mongoose, { mongo, models } from "mongoose";

const loyaltySchema = new mongoose.Schema(
  {
    amount: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    // storeId: {
    //   type: String,
    //   min: 3,
    //   max: 255,
    //   required: true,
    // },
    // account: {
    //   type: String,
    //   min: 6,
    //   max: 255,
    //   required: true
    // },
    // createdBy: {
    //   type: String,
    //   min: 3,
    //   max: 255,
    //   required: true,
    // },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
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

module.exports = mongoose.model("settingsLoyalty", loyaltySchema);
