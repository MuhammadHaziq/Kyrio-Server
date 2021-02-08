import express from "express";
import Discount from "../../modals/items/Discount";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, type, value, restricted } = req.body;
  const { _id, accountId } = req.authData;
  let { stores } = req.body;
  if (stores !== undefined && stores !== null) {
    stores = JSON.parse(stores);
  }
  const newDiscount = new Discount({
    title: title,
    accountId: accountId,
    type: type,
    value: value,
    restricted: restricted,
    stores: stores,
    created_by: _id,
  });
  try {
    const result = await newDiscount.save();
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Discount Already Register" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/:storeId", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const { storeId } = req.params;

    let storeFilter = {};
    if (storeId !== "0") {
      storeFilter.stores = { $elemMatch: { id: storeId } };
    }
    storeFilter.accountId = accountId;
    const result = await Discount.find(storeFilter).sort({
      _id: "desc",
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:ids", async (req, res) => {
  try {
    var { ids } = req.params;
    ids = JSON.parse(ids);
    ids.forEach(async (id) => {
      await Discount.deleteOne({ _id: id });
    });

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const { title, type, value, restricted } = req.body;
    const { id } = req.params;
    let { stores } = req.body;
    if (stores !== undefined && stores !== null) {
      stores = JSON.parse(stores);
    }
    const result = await Discount.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          title: title,
          type: type,
          value: value,
          restricted: restricted,
          stores: stores,
        },
      },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    );

    res.status(200).json({ data: result, message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
