import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  user_id: {
    type: String,
    min: 3,
    max: 255,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255
  },
  // features: [
  //   {
  //     featureId: {
  //       type: String,
  //       min: 3,
  //       max: 255,
  //       required: true,
  //     },
  //     featureName: {
  //       type: String,
  //       min: 3,
  //       max: 255,
  //       required: true,
  //     },
  //     description: {
  //       type: String,
  //       min: 3,
  //       max: 255,
  //       required: true,
  //     },
  //     icon: {
  //       type: String,
  //       min: 3,
  //       max: 255,
  //       required: true,
  //     },
  //     enable: Boolean,
  //   },
  // ],
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
  // settings: {
  //   settingModules: [
  //     {
  //       moduleId: {
  //         type: String,
  //         min: 3,
  //         max: 255,
  //         required: true,
  //       },
  //       moduleName: {
  //         type: String,
  //         min: 3,
  //         max: 255,
  //         required: true,
  //       },
  //       icon: {
  //         type: String,
  //         min: 3,
  //         max: 255,
  //       },
  //       heading: {
  //         type: String,
  //         min: 3,
  //         max: 255,
  //       },
  //       span: {
  //         type: String,
  //         min: 3,
  //         max: 255,
  //       },

  //       enable: Boolean,
  //       featureId: {
  //         type: String,
  //         min: 3,
  //         max: 255,
  //       },
  //     },
  //   ],
  // },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

roleSchema.index(
  {
    roleName: 1,
    user_id: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("role", roleSchema);
