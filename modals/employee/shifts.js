import mongoose from "mongoose";

const ShiftsSchema = new mongoose.Schema({
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
  pos_device_id: {
    type: String,
    min: 1,
    max: 255,
  },
  opened_at: {
    type: String,
    min: 1,
    max: 255,
  },
  closed_at: {
    type: String,
    min: 1,
    max: 255,
  },
  opened_by_employee: {
    type: String,
    min: 1,
    max: 255,
  },
  closed_by_employee: {
    type: String,
    min: 1,
    max: 255,
  },
  starting_cash: {
    type: Number,
    min: 0,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255,
    required: true
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
});

// timeCardSchema.index(
//   {
//     email: 1,
//   },
//   {
//     unique: true,
//   }
// );

module.exports = mongoose.model("Shifts", ShiftsSchema);
