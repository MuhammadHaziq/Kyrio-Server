import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
  },
  email: {
    type: String,
    min: 3,
    max: 255,
  },
  phone: {
    type: String,
    min: 3,
    max: 255,
  },
  posPin: {
    type: String,
    min: 3,
    max: 255,
  },
  enablePin: {
    type: Boolean
  },
  sendMail: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    required: true,
  },
  stores: [
    {
      _id: false,
      id: {
        type: String,
        min: 1,
        max: 255,
      },
      name: {
        type: String,
        min: 1,
        max: 255,
      },
    },
  ],
  password: {
    type: String,
    min: 0,
    max: 255,
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
  role: {
    _id: false,
    id: {
      type: String,
      min: 3,
      max: 255,
    },
    name: {
      type: String,
      min: 3,
      max: 255,
    },
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
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
    sparse: true
  }
);

module.exports = mongoose.model("users", usersSchema);
