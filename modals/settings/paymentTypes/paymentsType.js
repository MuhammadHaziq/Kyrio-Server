import mongoose, { mongo, models } from "mongoose";

const paymentsTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  paymentType: {
    paymentTypeId: {
      type: String,
    },
    paymentTypeName: {
      type: String,
    },
  },
  storeId: {
    type: String,
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

paymentsTypeSchema.index(
  {
    name: 1,
    storeId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("paymentsType", paymentsTypeSchema);
