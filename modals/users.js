import mongoose from "mongoose";

const usersSchema = new mongoose.Schema(
  {
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
      type: Boolean,
    },
    sendMail: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      required: true,
    },
    password: {
      type: String,
      min: 0,
      max: 255,
    },
    real: {
      type: String,
      min: 0,
      max: 255,
    },
    country: {
      type: String,
      min: 6,
      max: 255,
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
    stores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

usersSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("users", usersSchema);
