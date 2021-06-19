import mongoose, { mongo, models } from "mongoose";

const diningOptionSchema = new mongoose.Schema({
  storeId: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  account: {
    type: String,
    min: 6,
    max: 255,
    required: true
  },
  storeName: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  diningOptions: [
    {
      title: {
        type: String,
        min: 3,
        max: 255,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      position: {
        type: Number,
        default: 0,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
});

// diningOptionSchema.index(
//   {
//     "diningOptions.title": 1,
//     createdBy: 1,
//     storeId: 1,
//   },
//   {
//     unique: true,
//   }
// );
module.exports = mongoose.model("diningOption2", diningOptionSchema);
