import mongoose, { mongo, models } from "mongoose";

const paymentTypeSchema = new mongoose.Schema({
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  }
},{
  timestamps: true
});

paymentTypeSchema.index(
  {
    title: 1,
  },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model("paymentTypes", paymentTypeSchema);
