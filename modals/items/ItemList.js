import mongoose, { mongo, models } from "mongoose";

const itemListSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
  },
  availableForSale: {
    type: Boolean,
  },
  soldByType: {
    type: String,
    min: 3,
    max: 255,
  },
  price: {
    type: Number,
    max: 100000000000,
  },
  cost: {
    type: Number,
    max: 100000000000,
  },
  sku: {
    type: String,
    max: 100,
  },
  barcode: {
    type: String,
    max: 100,
  },
  trackStock: {
    type: Boolean,
    default: false,
    required: true,
  },
  compositeItem: {
    type: Boolean,
    default: false,
    required: true,
  },
  stockQty: {
    type: String,
    max: 10000000,
    default: 1,
    required: true,
  },
  varients: [
    {
      optionName: {
        type: String,
        min: 1,
        max: 255,
      },
      optionValue: [
        {
          variantName: [{
            type: Array
          }],
          price: {
            type: Number,
            max: 100000000000,
          },
          cost: {
            type: Number,
            max: 100000000000,
          },
          sku: {
            type: String,
            max: 100,
          },
          barcode: {
            type: String,
            max: 100000000000,
          },
        },
      ],
    },
  ],
  stores: [
    {
      store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
      price: {
        type: String,
        max: 255,
      },
      inStock: {
        type: String,
        max: 255,
      },
      lowStock: {
        type: String,
        max: 255,
      },
      variantName: {
        type: String,
        max: 255,
      },
      modifiers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "modifier",
      }],
      taxes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "itemTax",
      }],
    },
  ],
  repoOnPos: {
    type: String,
    max: 14,
  },
  image: {
    type: String,
    max: 255,
  },
  color: {
    type: String,
    max: 20,
  },
  shape: {
    type: String,
    max: 20,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts"
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categries"
  },
  modifiers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "modifier"
  }],
  taxes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "itemTax"
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  deleted: {
    type: Number,
    max: 1,
    default: 0
  },
  deletedAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
},{
  timestamps: true
});

module.exports = mongoose.model("itemList", itemListSchema);
