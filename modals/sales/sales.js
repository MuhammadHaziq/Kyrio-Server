import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({
  ticket_name: {
    type: String,
    min: 6,
    max: 255,
  },
  comments: {
    type: String,
    min: 6,
    max: 255,
  },
  open: {
    type: Boolean
  },
  total_price: {
    type: Number,
    min: 1,
    max: 100000000000,
  },
  cash_received: {
    type: Number,
    min: 1,
    max: 100000000000,
  },
  cash_return: {
    type: Number,
    min: 1,
    max: 100000000000,
  },
  total_after_discount: {
    type: Number,
    min: 1,
    max: 100000000000,
  },
  total_discount: {
    type: Number,
    min: 0,
    max: 1000000,
  },
  total_tax: {
    type: Number,
    min: 0,
    max: 1000000,
  },
  refund_status: {
    type: String,
    min: 3,
    max: 255,
  },
  items: [{
      id: {
        type: String,
        min: 6,
        max: 255,
      },
      price: {
        type: Number,
        min: 1,
        max: 100000000000,
      },
      quantity: {
        type: Number,
        min: 1,
        max: 255,
      },
      refund_quantity: {
        type: Number,
        min: 0,
        max: 255,
      },
      taxes: [{
        id: {
            type: String,
            min: 6,
            max: 255,
          },
        name: {
            type: String,
            min: 4,
            max: 255,
          },
        type: {
            type: String,
            min: 4,
            max: 255,
          },
      }],
      discounts: [{
        name: {
          type: String,
          min: 6,
          max: 255,
        },
        value: {
          type: Number,
          min: 2,
          max: 1000000,
        },
        type: {
          type: String,
          min: 2,
          max: 255,
        }
      }],
      modifiers: [{
        id: {
          type: String,
          min: 6,
          max: 255,
        },
        name: {
          type: String,
          min: 6,
          max: 255,
        },
        options: [{
          name: {
              type: String,
              min: 6,
              max: 255,
            },
          price: {
              type: Number,
              min: 1,
              max: 255,
            },
        }]
    }],
  }],
  discounts: [{
    name: {
      type: String,
      min: 6,
      max: 255,
    },
    value: {
      type: Number,
      min: 2,
      max: 1000000,
    },
    type: {
      type: String,
      min: 2,
      max: 255,
    }
  }],
  variant: {
      id: {
        type: String,
        min: 6,
        max: 255,
      },
      title: {
        type: String,
        min: 6,
        max: 255,
      },
      price: {
        type: String,
        min: 6,
        max: 255,
      },
    },
  store: {
    id: {
        type: String,
        min: 6,
        max: 255,
      },
    name: {
        type: String,
        min: 6,
        max: 255,
      }
  },
  created_by: {
    type: String,
    min: 6,
    max: 255,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

// salesSchema.index(
//   {
//     ticket_name: 1,
//   },
//   {
//     unique: true,
//   }
// );

module.exports = mongoose.model("sales", salesSchema);
