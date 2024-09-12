import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    allowBackoffice: {
      enable: Boolean,
      modules: [
        {
          backoffice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "backoffice",
          },
          enable: Boolean,
        },
      ],
    },
    allowPOS: {
      enable: Boolean,
      modules: [
        {
          posModule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "posModule",
          },
          enable: Boolean,
        },
      ],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

roleSchema.index(
  {
    title: 1,
    // user_id: 1,
    account: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("role", roleSchema);
