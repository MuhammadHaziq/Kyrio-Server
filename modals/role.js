import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  features: [{
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
  }],
  allowBackoffice: {
    enable: Boolean,
    modules: [
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
        isMenu: Boolean,
        isChild: Boolean,
        enable: Boolean,
      },
    ],    
  },
  allowPOS: {
    enable: Boolean,
    modules: [
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
        enable: Boolean,
      },
    ],
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("role", roleSchema);
