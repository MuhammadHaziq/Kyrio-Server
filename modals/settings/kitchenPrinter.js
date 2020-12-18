import mongoose, { mongo, models } from "mongoose";

const kitchenPrinterSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255,
    required: true
  },
  categories: {
    type: [
      {
        categoryId: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
        categoryName: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
      },
    ],
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

kitchenPrinterSchema.index(
  {
    name: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("kitchenPrinter", kitchenPrinterSchema);
