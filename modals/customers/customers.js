import mongoose from "mongoose";

const customersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 3,
      max: 255,
    },
    // account: {
    //   type: String,
    //   min: 6,
    //   max: 255,
    //   required: true
    // },
    email: {
      type: String,
      min: 3,
      max: 255,
    },
    phone: {
      type: String,
      min: 3,
      max: 255,
    },
    address: {
      type: String,
      min: 3,
      max: 255,
    },
    city: {
      type: String,
      min: 3,
      max: 255,
    },
    region: {
      type: String,
      min: 3,
      max: 255,
    },
    postal_code: {
      type: String,
      min: 3,
      max: 255,
    },
    country: {
      type: String,
      min: 3,
      max: 255,
    },
    customer_code: {
      type: String,
      min: 3,
      max: 255,
    },
    note: {
      type: String,
      min: 3,
      max: 255,
    },
    points_balance: {
      type: String,
      min: 0,
      max: 255,
      default: 0,
    },
    first_visit: {
      type: String,
    },
    last_visit: {
      type: String,
    },
    total_visits: {
      type: Number,
    },
    total_spent: {
      type: Number,
    },
    total_points: {
      type: Number,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    // created_by: {
    //   type: String,
    //   min: 3,
    //   max: 255,
    // },
  },
  {
    strict: false,
    timestamps: true,
  }
);

customersSchema.index(
  {
    email: 1,
    account: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("customers", customersSchema);
