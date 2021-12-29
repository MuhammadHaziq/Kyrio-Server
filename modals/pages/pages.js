import mongoose from "mongoose";

const pagesSchema = new mongoose.Schema({
  pageData: {
    type: String,
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
},{
  timestamps: true
});

pagesSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model("pages", pagesSchema);
