import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({
  receipt_number: {
    type: String,
    min: 6,
    max: 255,
  },
  ticket_name: {
    type: String,
    min: 6,
    max: 255,
  },
  receipt_type: {
    type: String,
    min: 6,
    max: 255,
  },
  refund_for: {
    type: String,
    min: 6,
    max: 255,
  },
  cancelled_at: {
    type: Date,
  },
  cancelled_by: {
    type: String,
    min: 6,
    max: 255,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255,
    required: true
  },
  sub_total: {
    type: String,
    min: 0,
    max: 1000000000000,
  },
  sale_timestamp: {
    type: Date,
  },
  comments: {
    type: String,
    min: 6,
    max: 255,
  },
  open: {
    type: Boolean
  },
  completed: {
    type: Boolean
  },
  total_price: {
    type: Number,
    min: 1,
    max: 100000000000,
  },
  cost_of_goods: {
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
    min: 0,
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
        _id: false,
        _id: {
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
        value: {
            type: Number,
            min: 0,
            max: 1000000,
          },
      }],
      discounts: [{
        _id: false,
        _id: {
          type: String,
          min: 6,
          max: 255,
        },
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
        _id: false,
        _id: {
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
      modifiers: [{
        _id: false,
        _id: {
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
    _id: false,
    _id: {
      type: String,
      min: 6,
      max: 255,
    },
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
  dining_option: {
    _id: false,
    _id: {
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
  customer: {
    _id: false,
    _id: {
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
  store: {
    _id: false,
    _id: {
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
  updated_at: {
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
