import mongoose, { mongo, models } from "mongoose";

const kitchenPrinterSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
  }],
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
},{
  timestamps: true
});

kitchenPrinterSchema.index(
  {
    title: 1,
  },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model("kitchenPrinter", kitchenPrinterSchema);
