import mongoose from "mongoose";

const employeeListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 3,
      max: 255,
    },
    // account: {
    //   type: String,
    //   min: 6,
    //   max: 255,
    //   required: true
    // },
    email: {
      type: String,
      min: 3,
      max: 255,
    },
    phone: {
      type: String,
      min: 3,
      max: 255,
    },
    // role: {
    //   _id: false,
    //   id: {
    //     type: String,
    //     min: 3,
    //     max: 255,
    //   },
    //   name: {
    //     type: String,
    //     min: 3,
    //     max: 255,
    //   },
    // },
    // stores: [
    //   {
    //     _id: false,
    //     id: {
    //       type: String,
    //       min: 1,
    //       max: 255,
    //     },
    //     name: {
    //       type: String,
    //       min: 1,
    //       max: 255,
    //     },
    //   },
    // ],
    posPin: {
      type: String,
      min: 3,
      max: 255,
    },
    sendMail: {
      type: Boolean,
      default: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
    },
    stores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    // created_by: {
    //   type: String,
    //   min: 3,
    //   max: 255,
    // },
  },
  {
    strict: false,
    timestamps: true,
  }
);

employeeListSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("employeeLists", employeeListSchema);
