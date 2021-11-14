import mongoose from "mongoose";

const DeletedAccounts = new mongoose.Schema(
  {
    email: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    buisnessName: {
      type: String,
      min: 0,
      max: 255,
    },
    reason: {
      type: String,
      min: 3,
      max: 255,
    },
    comments: {
      type: String,
      min: 0,
      max: 255,
    },
    confirm: {
      type: Boolean
    }
  },
  {
    timestamps: true,
  }
);

// DeletedAccounts.index(
//   {
//     email: 1,
//   },
//   {
//     unique: true,
//     sparse: true,
//   }
// );

module.exports = mongoose.model("deleted_accounts", DeletedAccounts);
