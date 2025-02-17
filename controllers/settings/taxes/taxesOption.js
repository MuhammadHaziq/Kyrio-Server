import express from "express";
import taxesOption from "../../../modals/settings/taxes/taxesOption";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title } = req.body;

  const newTaxesOption = new taxesOption({
    title: title
  });
  try {
    const result = await newTaxesOption.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const result = await taxesOption.find();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    await taxesOption.deleteOne({ _id: id });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
