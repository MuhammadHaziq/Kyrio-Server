import express from "express";
import kitchenPrinter from "../../modals/settings/kitchenPrinter";
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, categories, storeId } = req.body;
  let jsonCategoires = JSON.parse(categories);
  const { _id, accountId } = req.authData;

  const newKitchenPrinter = new kitchenPrinter({
    name: name,
    categories: jsonCategoires,
    storeId: storeId,
    createdBy: _id,
    accountId: accountId
  });
  try {
    const result = await newKitchenPrinter.save();

    res.status(201).json(result);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Kitchen Printer Already Reister" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/", async (req, res) => {
  try {
    const { _id, accountId } = req.authData;
    const result = await kitchenPrinter
      .find({ accountId: accountId })
      .sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    const { _id, accountId } = req.authData;
    id = JSON.parse(id);
    for (const kitId of id) {
      await kitchenPrinter.deleteOne({ _id: kitId, accountId: accountId });
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
    // { _id: id, storeId: storeId, createdBy: _id },
    const updatedRecord = await kitchenPrinter.findOneAndUpdate(
      { _id: id },
      // { _id: id, storeId: storeId },
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
