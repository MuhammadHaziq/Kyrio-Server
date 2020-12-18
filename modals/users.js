import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  email: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    required: true,
  },
  password: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  businessName: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  country: {
    type: String,
    min: 6,
    max: 255,
  },
  role_id: {
    type: String,
    min: 6,
    max: 255,
  },
  created_by: {
    type: String,
    min: 6,
    max: 255,
  },
  owner_id: {
    type: String,
    min: 6,
    max: 255,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

usersSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("users", usersSchema);
