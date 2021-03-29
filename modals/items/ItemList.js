import mongoose, { mongo, models } from "mongoose";

const itemListSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255,
    required: true,
  },
  category: {
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
          variantName: {
            type: String,
            min: 1,
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
            max: 100000000000,
          },
        },
      ],
    },
  ],
  stores: [
    {
      id: {
        type: String,
        min: 1,
        max: 255,
      },
      title: {
        type: String,
        min: 1,
        max: 255,
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
      modifiers: [
        {
          id: {
            type: String,
            min: 1,
            max: 255,
          },
          title: {
            type: String,
            min: 1,
            max: 255,
          },
        },
      ],
      taxes: [
        {
          id: {
            type: String,
            min: 1,
            max: 255,
          },
          title: {
            type: String,
            min: 1,
            max: 255,
          },
          type: {
            type: String,
            min: 1,
            max: 255,
          },
          value: {
            type: Number,
            min: 1,
            max: 1000000,
          },
        },
      ],
    },
  ],
  modifiers: [
    {
      id: {
        type: String,
        min: 1,
        max: 255,
      },
      title: {
        type: String,
        min: 1,
        max: 255,
      },
    },
  ],
  taxes: [
    {
      id: {
        type: String,
        min: 1,
        max: 255,
      },
      title: {
        type: String,
        min: 1,
        max: 255,
      },
      type: {
        type: String,
        min: 1,
        max: 255,
      },
      value: {
        type: Number,
        min: 1,
        max: 1000000,
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
  deleted: {
    type: Number,
    max: 1,
    default: 0
  },
  deleted_at: {
    type: Date,
    default: Date.now(),
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  created_by: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("itemList", itemListSchema);
