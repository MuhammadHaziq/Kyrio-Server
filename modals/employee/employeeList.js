import mongoose from "mongoose";

const employeeListSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255,
    required: true
  },
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
  role: {
    _id: false,
    id: {
      type: String,
      min: 3,
      max: 255,
    },
    name: {
      type: String,
      min: 3,
      max: 255,
    },
  },
  stores: [
    {
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
  ],
  posPin: {
    type: String,
    min: 3,
    max: 255,
  },
  sendMail: {
    type: Boolean,
    default: false
  },
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

employeeListSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("employeeLists", employeeListSchema);
