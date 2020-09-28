import express from "express";
import kitchenPrinter from "../../modals/settings/kitchenPrinter";
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, categories, storeId } = req.body;
  let jsonCategoires = JSON.parse(categories);
  const { _id } = req.authData;

  const newKitchenPrinter = new kitchenPrinter({
    name: name,
    categories: jsonCategoires,
    storeId: storeId,
    createdBy: _id,
  });
  try {
    const result = await newKitchenPrinter.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    const result = await kitchenPrinter
      .find({ createdBy: _id })
      .sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    const { _id } = req.authData;
    id = JSON.parse(id);
    for (const kitId of id) {
      await kitchenPrinter.deleteOne({ _id: kitId, createdBy: _id });
    }

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/", async (req, res) => {
  try {
    const { id, name, categories, storeId } = req.body;
    let jsonCategoires = JSON.parse(categories);
    const { _id } = req.authData;
    // { _id: id, storeId: storeId, createdBy: _id },
    const updatedRecord = await kitchenPrinter.findOneAndUpdate(
      { _id: id, storeId: storeId },
      {
        $set: {
          name: name,
          categories: jsonCategoires,
        },
      },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    );

    res
      .status(200)
      .json({ message: "Kitchen Printer Is Updated", data: updatedRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
