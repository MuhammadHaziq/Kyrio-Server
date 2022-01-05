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
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
},{
  timestamps: true
});

storeSchema.index(
  {
    title: 1,
    createdBy: 1,
  },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model("Store", storeSchema);
