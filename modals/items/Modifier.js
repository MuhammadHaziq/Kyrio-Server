import mongoose, { mongo, models } from "mongoose";

const modifierSchema = new mongoose.Schema({
    title: {
        type: String,
        min: 3,
        max: 255,
        required: true
    },
    modifierType: {
        type: String,
        min: 3,
        max: 255,
        required: true   
    },
    options: {
        type: [{
            optionName: {
                type: String,
                min: 3,
                max: 255,
                required: true
            },
            price: {
                type: Number,

                max: 100000000000,
                required: true
            }
        }]
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

module.exports = mongoose.model("modifier", modifierSchema);