import mongoose, { mongo, models } from "mongoose";

const modifierSchema = new mongoose.Schema({
    title: {
        type: String,
        min: 3,
        max: 255,
        required: true
    },
    type: {
        type: String,
        min: 3,
        max: 255,
        required: true   
    },
    options: [{
            name: {
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
        }],
    stores: [{
            id: {
                type: String,
                min: 1,
                max: 255,
                required: true
            },
            name: {
                type: String,
                min: 1,
                max: 255,
                required: true
            },
        }],
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