import mongoose, { mongo, models } from "mongoose";

const paymentsTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },
  paymentType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "paymentTypes",
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
  }
},{
  timestamps: true
});

paymentsTypeSchema.index(
  {
    name: 1,
    store: 1,
  },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model("paymentsType", paymentsTypeSchema);
