import mongoose, { mongo, models } from "mongoose";

const itemTaxSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  tax_rate: {
    type: Number,
    min: 0,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255,
    required: true
  },
  tax_type: {
    id: {
      type: String,
      min: 0,
    },
    title: {
      type: String,
      min: 0,
    },
  },
  tax_option: {
    id: {
      type: String,
      min: 0,
    },
    title: {
      type: String,
      min: 0,
    },
  },
  stores: {
    type: [
      {
        storeId: {
          type: String,
          min: 1,
          max: 255,
        },
        storeTitle: {
          type: String,
          min: 1,
          max: 255,
        },
      },
    ],
  },
  dinings: {
    type: [
      {
        diningId: {
          type: String,
          min: 1,
          max: 255,
        },
        diningTitle: {
          type: String,
          min: 1,
          max: 255,
        },
      },
    ],
  },
  categories: {
    type: [
      {
        categoryId: {
          type: String,
          min: 1,
          max: 255,
        },
        categoryTitle: {
          type: String,
          min: 1,
          max: 255,
        },
      },
    ],
  },
  items: {
    type: [
      {
        itemId: {
          type: String,
          min: 1,
          max: 255,
        },
        itemName: {
          type: String,
          min: 1,
          max: 255,
        },
        categoryId: {
          type: String,
          min: 1,
          max: 255,
        },
      },
    ],
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

itemTaxSchema.index(
  {
    title: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("itemTax", itemTaxSchema);
