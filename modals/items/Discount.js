import mongoose from "mongoose";

const DiscountSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    type: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    value: {
      type: Number,
      max: 100000000000,
    },
    restricted: {
      type: Boolean,
      min: 3,
      max: 255,
      required: true,
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
    deleted: {
      type: Number,
      max: 1,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("discount", DiscountSchema);
