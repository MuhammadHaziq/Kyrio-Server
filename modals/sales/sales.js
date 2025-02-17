import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
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
    order_number: {
      type: Number,
      min: 0,
      max: 10000000000,
    },
    cancelled_at: {
      type: Date,
    },
    cancelled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    account: {
      type: String,
      min: 6,
      max: 255,
      required: true,
    },
    sub_total: {
      type: Number,
      min: 0,
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
      type: Boolean,
    },
    completed: {
      type: Boolean,
    },
    total_price: {
      type: Number,
      min: 0,
    },
    cost_of_goods: {
      type: Number,
      min: 0,
    },
    cash_received: {
      type: Number,
      min: 0,
    },
    cash_return: {
      type: Number,
      min: 0,
    },
    total_discount: {
      type: Number,
      min: 0,
    },
    total_tax: {
      type: Number,
      min: 0,
    },
    total_tax_included: {
      type: Number,
      min: 0,
    },
    total_modifiers: {
      type: Number,
      min: 0,
    },
    refund_status: {
      type: String,
      min: 3,
      max: 255,
    },
    refund_amount: {
      type: Number,
      min: 0,
    },
    payment_method: {
      type: String,
      min: 3,
      max: 255,
    },
    payments: [
      {
        payment_type_id: {
          type: String,
          min: 0,
          max: 100000,
        },
        name: {
          type: String,
          min: 0,
          max: 255,
        },
        type: {
          type: String,
          min: 0,
          max: 255,
        },
        money_amount: {
          type: Number,
          min: 0,
        },
        paid_at: {
          type: Date,
        },
        isPaid: {
          type: Boolean,
        },
        locked: {
          type: Boolean,
        },
        changeAmount: {
          type: Number,
          min: 0,
        },
        payment_details: [
          {
            authorization_code: {
              type: String,
              min: 0,
              max: 255,
            },
            reference_id: {
              type: Number,
              min: 0,
              max: 10000,
            },
            entry_method: {
              type: String,
              min: 0,
              max: 255,
            },
            card_company: {
              type: String,
              min: 0,
              max: 255,
            },
            card_number: {
              type: String,
              min: 0,
              max: 255,
            },
          },
        ],
      },
    ],
    items: [
      {
        id: {
          type: String,
          min: 6,
          max: 255,
        },
        name: {
          type: String,
          min: 0,
          max: 255,
        },
        comment: {
          type: String,
          min: 0,
          max: 255,
        },
        sold_by_type: {
          type: String,
          min: 0,
          max: 255,
        },
        item_number: {
          type: Number,
          min: 0,
          max: 10000,
        },
        price: {
          type: Number,
          min: 0,
        },
        cost: {
          type: Number,
          min: 0,
        },
        track_stock: {
          type: Boolean,
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
        total_discount: {
          type: Number,
          min: 0,
        },
        total_tax: {
          type: Number,
          min: 0,
        },
        total_tax_included: {
          type: Number,
          min: 0,
        },
        total_price: {
          type: Number,
          min: 0,
        },
        total_modifiers: {
          type: Number,
          min: 0,
        },
        taxes: [
          {
            _id: false,
            _id: {
              type: String,
              min: 6,
              max: 255,
            },
            isChecked: {
              type: Boolean,
            },
            isEnabled: {
              type: Boolean,
            },
            taxOption: {
              type: String,
              min: 4,
              max: 255,
            },
            title: {
              type: String,
              min: 4,
              max: 255,
            },
            tax_type: {
              type: String,
              min: 4,
              max: 255,
            },
            tax_rate: {
              type: Number,
              min: 0,
            },
            tax_total: {
              type: Number,
              min: 0,
            },
          },
        ],
        discounts: [
          {
            _id: false,
            _id: {
              type: String,
              min: 6,
              max: 255,
            },
            isChecked: {
              type: Boolean,
            },
            restricted: {
              type: Boolean,
            },
            title: {
              type: String,
              min: 6,
              max: 255,
            },
            type: {
              type: String,
              min: 2,
              max: 255,
            },
            value: {
              type: Number,
              min: 0,
            },
            discount_total: {
              type: Number,
              min: 0,
            },
          },
        ],
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
            min: 0,
            max: 255,
          },
        },
        modifiers: [
          {
            _id: false,
            modifier: {
              _id: false,
              _id: {
                type: String,
                min: 6,
                max: 255,
              },
              isChecked: {
                type: Boolean,
              },
              isEnabled: {
                type: Boolean,
              },
              title: {
                type: String,
                min: 0,
                max: 255,
              },
            },
            options: [
              {
                _id: false,
                isChecked: {
                  type: Boolean,
                },
                option_modifier_id: {
                  type: String,
                  min: 6,
                  max: 255,
                },
                option_name: {
                  type: String,
                  min: 6,
                  max: 255,
                },
                price: {
                  type: Number,
                  min: 0,
                  max: 255,
                },
              },
            ],
          },
        ],
      },
    ],
    discounts: [
      {
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
        value: {
          type: Number,
          min: 2,
        },
        type: {
          type: String,
          min: 2,
          max: 255,
        },
      },
    ],
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
      },
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
      },
      email: {
        type: String,
        min: 6,
        max: 255,
      },
      points_earned: {
        type: Number,
        min: 0,
      },
      points_balance: {
        type: Number,
        min: 0,
      },
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
      },
    },
    cashier: {
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
    },
    device: {
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
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    send_email_check: {
      type: Boolean,
      default: false,
    },
    send_email: {
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
  },
  {
    strict: false,
    timestamps: true,
  }
);

// salesSchema.index(
//   {
//     ticket_name: 1,
//   },
//   {
//     unique: true,
//   }
// );

module.exports = mongoose.model("sales", salesSchema);
