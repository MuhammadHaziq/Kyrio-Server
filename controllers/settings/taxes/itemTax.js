import express from "express";
import itemTax from "../../../modals/settings/taxes/itemTax";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, tax_rate, tex } = req.body;
  const { _id } = req.authData;
  let { tax_type, tax_option, stores, dinings, categories, items } = req.body;
  stores = JSON.parse(stores);
  dinings = JSON.parse(dinings);
  categories = JSON.parse(categories);
  items = JSON.parse(items);
  tax_option = JSON.parse(tax_option);
  tax_type = JSON.parse(tax_type);

  const newItemTax = new itemTax({
    title: title,
    tax_rate: tax_rate,
    tax_type: tax_type,
    tax_option: tax_option,
    stores: stores,
    dinings: dinings,
    categories: categories,
    items: items,
    createdBy: _id,
  });
  try {
    const result = await newItemTax.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    const result = await itemTax.find({ createdBy: _id });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    await itemTax.deleteOne({ _id: id });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
