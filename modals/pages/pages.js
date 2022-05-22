import mongoose from "mongoose";

const pagesSchema = new mongoose.Schema(
  {
    pageData: {
      type: String,
      required: true,
    },
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
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("pages", pagesSchema);
