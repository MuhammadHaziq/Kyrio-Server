import mongoose from "mongoose";

const employeeListSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
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
