import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    catTitle: {
        type: String,
        min: 3,
        max: 255,
        required: true,
    },
    accountId: {
        type: String,
        min: 6,
        max: 255,
        required: true
      },
    catColor: {
        type: String,
        min: 3,
        max: 255,
        required: true,
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
CategorySchema.index(
    {
        catTitle: 1,
    },
    {
        unique: true,
    }
);
module.exports = mongoose.model("categries", CategorySchema);
