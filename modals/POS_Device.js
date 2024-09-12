import mongoose from "mongoose";

const posDeviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    deviceNo: {
      type: Number,
      min: 1,
      max: 100000,
      required: true,
    },
    noOfSales: {
      type: Number,
      min: 0,
      max: 10000000000,
    },
    order_number: {
      type: Number,
      min: 0,
      max: 10000000000,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    udid: {
      type: String,
      min: 3,
      max: 255,
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);
posDeviceSchema.index(
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
module.exports = mongoose.model("pos_device", posDeviceSchema);
