import mongoose, { mongo, models } from "mongoose";

const itemListSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
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
    required: true,
  },
  soldByType: {
    type: String,
    min: 3,
    max: 255,
    required: true,
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
    min: 1,
    max: 100,
  },
  barcode: {
    type: String,
    min: 1,
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
  modifiersStatus: {
    type: Boolean,
    default: false,
    required: true,
  },
  dsd: {
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
        required: true,
      },
      optionValue: [
        {
          title: {
            type: String,
            min: 1,
            max: 255,
            required: true,
          },
          price: {
            type: Number,
            min: 1,
            max: 100000000000,
            required: true,
          },
          cost: {
            type: Number,
            min: 1,
            max: 100000000000,
          },
          SKU: {
            type: String,
            min: 1,
            max: 100,
          },
          barcode: {
            type: String,
            min: 1,
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
        min: 1,
        max: 255,
      },
      inStock: {
        type: String,
        min: 1,
        max: 255,
      },
      lowStock: {
        type: String,
        min: 1,
        max: 255,
      },
      variantName: {
        type: String,
        min: 1,
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
    required: true,
  },
  image: {
    type: String,
    min: 3,
    max: 255,
    required: false,
  },
  color: {
    type: String,
    max: 20,
    required: false,
  },
  shape: {
    type: String,
    max: 20,
    required: false,
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

module.exports = mongoose.model("itemList", itemListSchema);
