import mongoose from "mongoose";

const paymentsTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentmethods",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    cashPaymentRound: {
      type: Number,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

paymentsTypeSchema.index(
  {
    title: 1,
    store: 1,
    account: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("paymentsType", paymentsTypeSchema);
