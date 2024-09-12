import mongoose from "mongoose";

const userTicketsSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      min: 0,
      required: true,
    },
    userId: {
      type: String,
      min: 0,
    },
    email: {
      type: String,
      min: 0,
    },
    url: {
      type: String,
      min: 0,
    },
    status: {
      type: Boolean,
    },
    expireAt: {
      type: Date,
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

userTicketsSchema.index(
  {
    uuid: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("user_tickets", userTicketsSchema);
