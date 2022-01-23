import mongoose, { mongo, models } from "mongoose";

const itemTaxSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    tax_rate: {
      type: Number,
      min: 0,
    },
    tax_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "taxesType",
    },
    tax_option: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "taxesOption",
    },
    stores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
    dinings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "diningOption",
      },
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
      },
    ],
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "items",
      },
    ],
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

itemTaxSchema.index(
  {
    title: 1,
    account: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("itemTax", itemTaxSchema);
