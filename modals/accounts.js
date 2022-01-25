import mongoose from "mongoose";

const accountsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    decimal: {
      type: Number,
      min: 0,
      max: 2,
    },
    timeFormat: {
      type: String,
      min: 2,
      max: 2,
    },
    dateFormat: {
      type: String,
      min: 0,
      max: 10,
    },
    features: [
      {
        feature: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "features",
        },
        enable: Boolean,
      },
    ],
    settings: [
      {
        module: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "settings",
        },
        enable: Boolean,
        feature: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "features",
        },
      },
    ],
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

accountsSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("accounts", accountsSchema);
