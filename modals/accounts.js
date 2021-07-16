import mongoose from "mongoose";

const accountsSchema = new mongoose.Schema({
  businessName: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  email: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  password: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  timezone: {
    type: String,
    min: 3,
    max: 255,
  },
  language: {
    type: String,
    min: 6,
    max: 255,
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
  settings: [{
        module: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "settings",
        },
        enable: Boolean,
        feature: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "features",
        },
      }],
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      }
},{
  timestamps: true
});

accountsSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model("accounts", accountsSchema);
