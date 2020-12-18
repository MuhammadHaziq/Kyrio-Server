import mongoose, { mongo, models } from "mongoose";

const posDeviceSchema = new mongoose.Schema({
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
    required: true,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255,
    required: true
  },
  store: {
    storeId: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    storeName: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
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
  isActive: {
    type: Boolean,
    default: false,
  },
});
posDeviceSchema.index(
  {
    title: 1,
    "store.storeId": 1,
  },
  {
    unique: true,
  }
);
module.exports = mongoose.model("pos_device", posDeviceSchema);
