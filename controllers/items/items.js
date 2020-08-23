
import express from "express";
import categoriesRouter from "./categories";
import discountRouter from "./discounts";
import modifierRouter from "./modifers";
import ItemList from "../../modals/items/ItemList";
import uploadFiles from "../fileHandler/uploadFiles";
var router = express.Router();

router.post('/', async (req, res) => {
    const { name, availableForSale, soldByType, price, cost,
        sku, barcode, repoOnPos } = req.body;
    var { category, varients, stores, modifiers, taxes, itemColor, itemShape } = req.body;
    const { _id } = req.authData;

    varients = JSON.parse(varients);
    stores = JSON.parse(stores);
    modifiers = JSON.parse(modifiers);
    taxes = JSON.parse(taxes);
    category = JSON.parse(category);
    var itemImageName = "";

    if (repoOnPos == "image") {

        if (req.files != null && req.files != "null" && typeof req.files != 'undefined') {

            if (typeof req.files.itemImage != 'undefined') {
                var files = req.files.itemImage;
                var uploadResult = await uploadFiles.uploadImages(files, 'items');
                if (!uploadResult.success) {

                    res.status(200).json({ message: "error" });
                    conn.release();
                }
                console.log(uploadResult);
                itemImageName = uploadResult.images[0];
                itemColor = "";
                itemShape = "";
            }
        }
    }
    const newItemList = new ItemList({
        name, category, availableForSale, soldByType, price, cost,
        sku, barcode, varients, stores, modifiers, taxes, repoOnPos, itemImageName, itemColor, itemShape,
        createdBy: _id
    });
    try {
        const result = await newItemList.save();
        res.status(201).json(result);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get('/', async (req, res) => {
    try {
        const { _id } = req.authData;
        const { page, limit, storeId } = req.query;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        var result = await ItemList.find({stores: {$elemMatch: {storeId: storeId}}, createdBy: _id });

        result = result.slice(startIndex, endIndex);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});
router.delete('/:ids', async (req, res) => {
    try {
        var { ids } = req.params;
        ids = JSON.parse(ids)
        ids.forEach(async (id) => {

            await ItemList.deleteOne({ _id: id });
        });

        res.status(200).json({ message: "deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

router.use("/categories", categoriesRouter);
router.use("/discount", discountRouter);
router.use("/modifier", modifierRouter);
router.use("/items", ItemList);
module.exports = router;
