import mongoose, { mongo, models } from "mongoose";

const itemListSchema = new mongoose.Schema(
  {
    title: {
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
    autoSKU: {
      type: Boolean,
      default: false,
      required: true,
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
        variantNames: [
          {
            type: Array,
          },
        ],
        optionValue: [
          {
            variantName: [
              {
                type: Array,
              },
            ],
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
          type: Number,
          max: 100000000000,
        },
        lowStock: {
          type: Number,
          max: 100000000000,
        },
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
      ref: "accounts",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
    },
    modifiers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "modifier",
      },
    ],
    taxes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "itemTax",
      },
    ],
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
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);
// Item with same name can be exist please comment this - Tahir
// itemListSchema.index(
//   {
//       title: 1,
//   },
//   {
//       unique: true,
//       sparse: true
//   }
// );

module.exports = mongoose.model("items", itemListSchema);
