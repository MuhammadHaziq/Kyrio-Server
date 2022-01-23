import mongoose, { mongo, models } from "mongoose";

const taxSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    taxRate: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    taxType: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    taxOption: {
      type: String,
      min: 1,
      max: 255,
      required: true,
    },
    depOnDining: {
      type: Boolean,
      default: false,
    },
    stores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
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

taxSchema.index(
  {
    title: 1,
    account: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("tax", taxSchema);
