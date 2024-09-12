import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    features: [
      {
        featureName: {
          type: String,
          min: 3,
          max: 255,
        },
        handle: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
        description: {
          type: String,
          min: 3,
          max: 255,
        },
        icon: {
          type: String,
          min: 3,
          max: 255,
        },
      },
    ],
    backofficeModules: [
      {
        moduleName: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
        handle: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
        description: {
          type: String,
          min: 3,
          max: 255,
        },
        isMenu: Boolean,
        isChild: Boolean,
      },
    ],
    posModules: [
      {
        moduleName: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
        handle: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
        description: {
          type: String,
          min: 3,
          max: 255,
        },
      },
    ],
    settings: [
      {
        moduleName: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
        handle: {
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
      },
    ],
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("module", moduleSchema);
