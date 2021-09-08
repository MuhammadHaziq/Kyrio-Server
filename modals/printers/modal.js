import mongoose from "mongoose";

const printerModalSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  Interfaces: {
    type: String,
  },
  page_width: {
    type: String,
  },
  is_enabled: {
    type: Boolean,
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
},{
  timestamps: true
});

printerModalSchema.index(
  {
    title: 1,
  },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model("printerModal", printerModalSchema);
