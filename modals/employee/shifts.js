import mongoose from "mongoose";

const ShiftsSchema = new mongoose.Schema(
  {
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
    starting_cash: {
      type: Number,
    },
    cash_payments: {
      type: Number,
    },
    cash_refunds: {
      type: Number,
    },
    paid_in: {
      type: Number,
    },
    paid_out: {
      type: Number,
    },
    expected_cash: {
      type: Number,
    },
    actual_cash: {
      type: Number,
    },
    gross_sales: {
      type: Number,
    },
    refunds: {
      type: Number,
    },
    discounts: {
      type: Number,
    },
    net_sales: {
      type: Number,
    },
    tip: {
      type: Number,
    },
    surcharge: {
      type: Number,
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
        },
      },
    ],
    cash_movements: [
      {
        type: {
          type: String,
          min: 0,
          max: 30,
        },
        amount: {
          type: Number,
        },
        comment: {
          type: String,
          min: 0,
        },
        employee_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
        created_at: {
          type: Date,
        },
      },
    ],
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    opened_by_employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    closed_by_employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    pos_device_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pos_device",
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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
