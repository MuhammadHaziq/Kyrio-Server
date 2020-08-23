import mongoose, { mongo, models } from "mongoose";

const taxSchema = new mongoose.Schema({
    title: {
        type: String,
        min: 3,
        max: 255,
        required: true
    },
    taxRate: {
        type: String,
        min: 3,
        max: 255,
        required: true   
    },
    taxType: {
        type: String,
        min: 3,
        max: 255,
        required: true
    },
    taxOption: {
        type: String,
        min: 1,
        max: 255,
        required: true
    },
    depOnDining: {
        type: Boolean,
        default: false
    },
    stores: {
        type: [{
            storeId: {
                type: String,
                min: 1,
                max: 255,
                required: true
            },
            storeName: {
                type: String,
                min: 1,
                max: 255,
                required: true
            },
        }]
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

module.exports = mongoose.model("tax", taxSchema);