import mongoose, { mongo, models } from "mongoose";

const posDeviceSchema = new mongoose.Schema({
    title: {
        type: String,
        min: 3,
        max: 255,
        required: true
    },
    store: {
        storeId:{
            type: String,
            min: 3,
            max: 255,
            required: true
        },
        storeName:{
            type: String,
            min: 3,
            max: 255,
            required: true
        }
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
    },
    isActive: {
        type: Boolean,
        default: false
    }
});

posDeviceSchema.index(
    {
      title: 1,
      createdBy: 1,
    },
    {
      unique: true,
    }
  );
module.exports = mongoose.model("pos_device", posDeviceSchema);