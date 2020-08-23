import mongoose, { mongo, models } from "mongoose";

const itemListSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 3,
        max: 255,
        required: true
    },
    category: {
        categoryId: {
            type: String,
            min: 3,
            max: 255
        },
        categoryName: {
            type: String,
            min: 3,
            max: 255
        }
    },
    availableForSale: {
        type: Boolean,
        required: true
    },
    soldByType: {
        type: String,
        min: 3,
        max: 255,
        required: true
    },
    price: {
        type: Number,
        max: 100000000000
    },
    cost: {
        type: Number,
        max: 100000000000
    },
    sku: {
        type: String,
        min: 1,
        max: 100
    },
    barcode: {
        type: String,
        min: 1,
        max: 100
    },
    stock: {
        type: Number,
        max:  10000000,
        default: 0
    },
    varients: {
        type: [{
            varientTitle: {
                type: String,
                min: 1,
                max: 255,
                required: true
            },
            varientPrice: {
                type: Number,
                min: 1,
                max: 100000000000,
                required: true
            },
            varientCost: {
                type: Number,
                min: 1,
                max: 100000000000
            }, varientSKU: {
                type: String,
                min: 1,
                max: 100
            },
            varientBarcode: {
                type: String,
                min: 1,
                max: 100
            },

        }]
    },
    stores: {
        type: [{
            storeId: {
                type: String,
                min: 1,
                max: 255
            },
            storeTitle: {
                type: String,
                min: 1,
                max: 255
            }
        }]
    },
    modifiers: {
        type: [{
            modifierId: {
            type: String,
            min: 1,
            max: 255
            },
            modifierTitle: {
            type: String,
            min: 1,
            max: 255
            }
            
        }]
    },
    taxes: {
        type: [{
            taxId: {
            type: String,
            min: 1,
            max: 255
            },
            taxTitle: {
            type: String,
            min: 1,
            max: 255
            }
            
        }]
    },
    repoOnPos: {
        type: String,
        max: 14,
        required: true,
    }, itemImageName: {
        type: String,
        min: 3,
        max: 255,
        required: false,
    },
    itemColor: {
        type: String,
        max: 20,
        required: false,
    },
    itemShape: {
        type: String,
        max: 20,
        required: false,
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

module.exports = mongoose.model("itemList", itemListSchema); 