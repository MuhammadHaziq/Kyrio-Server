import mongoose, { mongo, models } from "mongoose";

const storeSchema = new mongoose.Schema({
    title: {
        type: String,
        min: 3,
        max: 255,
        required: true
    },
    address: {
        type: String,
        min: 3,
        max: 1000
    },
    phone: {
        type: String,
        min: 11,
        max: 15
    },
    description: {
        type: String,
        min: 0,
        max: 4000
    },
    accountId: {
        type: String,
        min: 0,
        max: 4000
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    createdBy: {
        type: String,
        min: 3,
        max: 255,
        required: true,
    }
});

storeSchema.index(
  {
    title: 1,
    createdBy: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Store", storeSchema);
