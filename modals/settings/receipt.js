import mongoose, { mongo, models } from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    header: {
      type: String,
      min: 0,
      max: 255,
    },
    footer: {
      type: String,
      min: 0,
      max: 255,
    },
    receiptImage: {
      type: String,
      min: 3,
      max: 255,
    },
    printedReceiptImage: {
      type: String,
      min: 3,
      max: 255,
    },
    show_customer_info: {
      type: Boolean,
      default: false,
      required: true,
    },
    show_comments: {
      type: Boolean,
      default: false,
      required: true,
    },
    language: {
      type: String,
      min: 3,
      max: 255,
      required: true,
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
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("receipts", receiptSchema);
