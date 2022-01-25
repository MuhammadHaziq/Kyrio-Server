import mongoose from "mongoose";

const ShiftsSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    pos_device_id: {
      type: String,
      min: 1,
      max: 255,
    },
    opened_at: {
      type: String,
      min: 1,
      max: 255,
    },
    closed_at: {
      type: String,
      min: 1,
      max: 255,
    },
    opened_by_employee: {
      type: String,
      min: 1,
      max: 255,
    },
    closed_by_employee: {
      type: String,
      min: 1,
      max: 255,
    },
    starting_cash: {
      type: Number,
      min: 0,
    },
    cash_payments: {
      type: Number,
      min: 0,
    },
    cash_refunds: {
      type: Number,
      min: 0,
    },
    paid_in: {
      type: Number,
      min: 0,
    },
    paid_out: {
      type: Number,
      min: 0,
    },
    expected_cash: {
      type: Number,
      min: 0,
    },
    actual_cash: {
      type: Number,
      min: 0,
    },
    gross_sales: {
      type: Number,
      min: 0,
    },
    refunds: {
      type: Number,
      min: 0,
    },
    discounts: {
      type: Number,
      min: 0,
    },
    net_sales: {
      type: Number,
      min: 0,
    },
    tip: {
      type: Number,
      min: 0,
    },
    surcharge: {
      type: Number,
      min: 0,
    },
    taxes: [
      {
        _id: false,
        _id: {
          type: String,
          min: 1,
          max: 255,
        },
        money_amount: {
          type: Number,
          min: 0,
        },
      },
    ],
    payments: [
      {
        _id: false,
        _id: {
          type: String,
          min: 1,
          max: 255,
        },
        money_amount: {
          type: Number,
          min: 0,
        },
      },
    ],
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    created_by: {
      type: String,
      min: 3,
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

// timeCardSchema.index(
//   {
//     email: 1,
//   },
//   {
//     unique: true,
//   }
// );

module.exports = mongoose.model("Shifts", ShiftsSchema);
