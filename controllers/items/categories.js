import express from "express";
import Category from "../../modals/items/Category";
const router = express.Router();

router.post('/', async (req, res) => {
    const { catTitle, catColor } = req.body;
    const { _id } = req.authData;
    const newCat = new Category({
        catTitle: catTitle,
        catColor: catColor,
        createdBy: _id
    });
    try {
        const newCatResult = await newCat.save();
        res.status(201).json(newCatResult);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }


});
router.get('/', async (req, res) => {
    try {
        const { _id } = req.authData;
        const allCat = await Category.find({ createdBy: _id });
        res.status(200).json(allCat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});
router.delete('/:ids', async (req, res) => {
    try {
        var { ids } = req.params;
        ids = JSON.parse(ids)
        ids.forEach(async (id) => {

            await Category.deleteOne({ _id: id });
        });

        res.status(200).json({ message: "deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { catTitle, catColor } = req.body;
        await Category.updateOne({ _id: id }, {
            $set: {
                catTitle: catTitle,
                catColor: catColor
            }
        });

        res.status(200).json({ message: "updated" });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

module.exports = router;