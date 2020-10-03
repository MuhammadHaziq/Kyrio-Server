import mongoose, { mongo, models } from "mongoose";

const receiptSchema = new mongoose.Schema({
  receiptImage: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  printedReceiptImage: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  header: {
    type: String,
    min: 3,
    max: 255,
  },
  footer: {
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
  storeId: {
    type: String,
    min: 3,
    max: 255,
    required: true,
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

module.exports = mongoose.model("receipts", receiptSchema);
