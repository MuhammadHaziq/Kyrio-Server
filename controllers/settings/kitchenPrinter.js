import express from "express";
import kitchenPrinter from "../../modals/settings/kitchenPrinter";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, categories, store } = req.body;
  const { _id, account } = req.authData;

  const newKitchenPrinter = new kitchenPrinter({
    title: title,
    categories: categories,
    store: store,
    createdBy: _id,
    account: account,
  });
  try {
    const insert = await newKitchenPrinter.save();
    const result = await kitchenPrinter
    .findOne({ account: account, _id: insert._id }).populate('categories', ["_id","title"]).populate('store', ["_id","title"])
    .sort({ _id: "desc" });
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
    const { _id, account } = req.authData;
    const result = await kitchenPrinter
      .find({ account: account }).populate('categories', ["_id","title"]).populate('store', ["_id","title"])
      .sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/row/:id", async (req, res) => {
  try {
    const { _id, account } = req.authData;
    const { id } = req.params;
    const result = await kitchenPrinter
      .findOne({ account: account, _id: id }).populate('categories', ["_id","title"]).populate('store', ["_id","title"])
      .sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    const { _id, account } = req.authData;
    id = JSON.parse(id);
    for (const kitId of id) {
      await kitchenPrinter.deleteOne({ _id: kitId, account: account });
    }

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/", async (req, res) => {
  try {
    const { id, title, categories, storeId } = req.body;
    const updatedRecord = await kitchenPrinter.findOneAndUpdate(
      { _id: id },
      // { _id: id, storeId: storeId },
      {
        $set: {
          title: title,
          categories: categories,
        },
      },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    ).populate('categories', ["_id","title"]).populate('store', ["_id","title"]);

    res
      .status(200)
      .json({ message: "Kitchen Printer Is Updated", data: updatedRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
