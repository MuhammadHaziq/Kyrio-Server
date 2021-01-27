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
      featureId: {
        type: String,
        min: 3,
        max: 255,
        required: true,
      },
      featureName: {
        type: String,
        min: 3,
        max: 255,
        required: true,
      },
      description: {
        type: String,
        min: 3,
        max: 255,
        required: true,
      },
      icon: {
        type: String,
        min: 3,
        max: 255,
        required: true,
      },
      enable: Boolean,
    },
  ],
  settings: {
    settingModules: [
      {
        moduleId: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
        moduleName: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
        icon: {
          type: String,
          min: 3,
          max: 255,
        },
        heading: {
          type: String,
          min: 3,
          max: 255,
        },
        span: {
          type: String,
          min: 3,
          max: 255,
        },

        enable: Boolean,
        featureId: {
          type: String,
          min: 3,
          max: 255,
        },
      },
    ],
  },
  createdBy: {
    type: String,
    min: 6,
    max: 255,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

accountsSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("accounts", accountsSchema);
