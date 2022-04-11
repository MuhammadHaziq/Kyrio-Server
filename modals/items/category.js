import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    color: {
      type: String,
      min: 3,
      max: 255,
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
    deleted: {
      type: Number,
      max: 1,
      default: 0,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);
// CategorySchema.index(
//   {
//     title: 1,
//     account: 1,
//   },
//   {
//     unique: true,
//     sparse: true,
//   }
// );
module.exports = mongoose.model("categories", CategorySchema);
