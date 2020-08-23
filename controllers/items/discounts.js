import express from "express";
import Discount from "../../modals/items/Discount";
const router = express.Router();

router.post('/', async (req, res) => {
    const { title, type, value, restricted } = req.body;
    const { _id } = req.authData;
    const newDiscount = new Discount({
        title: title,
        type: type,
        value: value,
        restricted: restricted,
        createdBy: _id
    });
    try {
        const result = await newDiscount.save();
        res.status(201).json(result);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }


});
router.get('/', async (req, res) => {
    try {
        const { _id } = req.authData;
        const result = await Discount.find({ createdBy: _id });
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

            await Discount.deleteOne({ _id: id });
        });

        res.status(200).json({ message: "deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});
router.patch('/:id', async (req, res) => {
    try {
        const { title, type, value, restricted } = req.body;
        const { id } = req.params;

        await Discount.updateOne({ _id: id }, {
            $set: {
                title: title,
                type: type,
                value: value,
                restricted: restricted
            }
        });

        res.status(200).json({ message: "updated" });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

module.exports = router;