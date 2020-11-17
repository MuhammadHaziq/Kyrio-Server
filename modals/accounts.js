import mongoose from "mongoose";

const accountsSchema = new mongoose.Schema({
  businessName: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  email: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  password: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  timezone: {
    type: String,
    min: 3,
    max: 255,
  },
  language: {
    type: String,
    min: 6,
    max: 255,
  },
  createdBy: {
    type: String,
    min: 6,
    max: 255,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

accountsSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("accounts", accountsSchema);
