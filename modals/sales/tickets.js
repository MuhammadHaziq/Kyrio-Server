import mongoose from "mongoose";

const ticketsSchema = new mongoose.Schema(
  {
    ticket_name: {
      type: Array,
      required: true,
    },
    comments: {
      type: String,
      min: 6,
      max: 255,
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

// ticketsSchema.index(
//   {
//     ticket_name: 1,
//   },
//   {
//     unique: true,
//   }
// );

module.exports = mongoose.model("tickets", ticketsSchema);
