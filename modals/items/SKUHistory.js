import mongoose from "mongoose";

const skuHistorySchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      min: 5,
      max: 40,
      required: true,
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
skuHistorySchema.index(
  {
    sku: 1,
    account: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);
module.exports = mongoose.model("skuHistory", skuHistorySchema);
