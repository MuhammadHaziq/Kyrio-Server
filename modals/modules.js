import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  features: [
    {
      featureName: {
        type: String,
        min: 3,
        max: 255,
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
      description: {
        type: String,
        min: 3,
        max: 255,
      },
      isMenu: Boolean,
      isChild: Boolean
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
      description: {
        type: String,
        min: 3,
        max: 255,
      },
    },
  ],
  created: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("module", moduleSchema);
