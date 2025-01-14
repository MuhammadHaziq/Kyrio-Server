import mongoose from "mongoose";

const timeCardSchema = new mongoose.Schema(
  {
    employee: {
      _id: false,
      id: {
        type: String,
        min: 1,
        max: 255,
      },
      name: {
        type: String,
        min: 1,
        max: 255,
      },
    },
    account: {
      type: String,
      min: 6,
      max: 255,
      required: true,
    },
    store: {
      _id: false,
      id: {
        type: String,
        min: 1,
        max: 255,
      },
      name: {
        type: String,
        min: 1,
        max: 255,
      },
    },
    timeDetail: [
      {
        clockInDate: {
          type: String,
          min: 1,
          max: 255,
        },
        clockOutDate: {
          type: String,
          min: 1,
          max: 255,
        },
        clockInTime: {
          type: String,
          min: 1,
          max: 255,
        },
        clockOutTime: {
          type: String,
          min: 1,
          max: 255,
        },
        totalWorkingHour: {
          type: String,
          min: 1,
          max: 255,
        },
        event: {
          type: String,
          default: "Created",
        },
        created_at: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    created_by: {
      type: String,
      min: 3,
      max: 255,
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
    updated_at: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

// timeCardSchema.index(
//   {
//     email: 1,
//   },
//   {
//     unique: true,
//   }
// );

module.exports = mongoose.model("TimeCard", timeCardSchema);
