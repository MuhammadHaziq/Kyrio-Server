import mongoose from "mongoose";

const printerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 0,
      max: 255,
    },
    connect_interface: {
      type: String,
      min: 1,
    },
    paper_width: {
      type: String,
    },
    address: {
      type: String,
    },
    PRNB: {
      type: Boolean,
    },
    PO: {
      type: Boolean,
    },
    APR: {
      type: Boolean,
    },
    modal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "printerModal",
    },
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "kitchenPrinter",
      },
    ],
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

// printerSchema.index(
//   {
//     title: 1,
//   },
//   {
//     unique: true,
//     sparse: true
//   }
// );

module.exports = mongoose.model("printers", printerSchema);
