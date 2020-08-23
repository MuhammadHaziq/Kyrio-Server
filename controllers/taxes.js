import express from "express";
import Tax from "../modals/Tax";
const router = express.Router();

router.post('/', async (req, res) => {
    const {title, taxRate, taxType, taxOption, depOnDining, stores } = req.body;
    const { _id } = req.authData;
    let jsonStores = JSON.parse(stores);

    const newTax = new Tax({
        title: title,
        taxRate: taxRate,
        taxType: taxType,
        taxOption: taxOption,
        depOnDining: depOnDining,
        stores: jsonStores,
        createdBy: _id
    });
    try {
        const result = await newTax.save();
        res.status(201).json(result);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }


});
router.get('/', async (req, res) => {
    try {
        const { _id } = req.authData;
        const { storeId } = req.body;
        const result = await Tax.find({stores: {$elemMatch: {storeId: storeId}}, createdBy: _id });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});
router.post('/getStoreTaxes', async (req, res) => {
    try {
        const { _id } = req.authData;
        const { storeId } = req.body;
        const result = await Tax.find({stores: {$elemMatch: {storeId: storeId}}, createdBy: _id });
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

            await Tax.deleteOne({ _id: id });
        });


        res.status(200).json({ message: "deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});
router.patch('/:id', async (req, res) => {
    try {
        const {title, taxRate, taxType, taxOption, depOnDining, stores } = req.body;
        const { id } = req.params;

        let jsonStores = JSON.parse(stores);

        await Store.updateOne({ _id: id }, {
            $set: {
                title: title,
                taxRate: taxRate,
                taxType: taxType,
                taxOption: taxOption,
                depOnDining: depOnDining,
                stores: jsonStores,
            }
        });

        res.status(200).json({ message: "updated" });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

module.exports = router;