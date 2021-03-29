import express from "express";
import Discount from "../../modals/items/Discount";
import { DISCOUNT_INSERT, DISCOUNT_UPDATE, DISCOUNT_DELETE } from "../../sockets/events";
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
    req.io.emit(DISCOUNT_INSERT, {data: result, user: _id})
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
    storeFilter.deleted = 0;
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
    const { _id, accountId } = req.authData;
    ids = JSON.parse(ids);

    let del = await Discount.updateMany({ _id: {$in: ids}, accountId: accountId }, { $set: {deleted: 1, deleted_at: Date.now() }}, {
      new: true,
      upsert: true,
    })

    if(del.n > 0 && del.nModified > 0){
      req.io.emit(DISCOUNT_DELETE, {data: ids, user: _id})
    }

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const { title, type, value, restricted } = req.body;
    const { id } = req.params;
    const { _id, accountId } = req.authData;
    let { stores } = req.body;
    if (stores !== undefined && stores !== null) {
      stores = JSON.parse(stores);
    }
    const result = await Discount.findOneAndUpdate(
      { _id: id, accountId: accountId },
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
    req.io.emit(DISCOUNT_UPDATE, {data: result, user: _id})
    res.status(200).json({ data: result, message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/row/:id", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const { id } = req.params;

    let storeFilter = {};
    storeFilter.accountId = accountId;
    storeFilter._id = id;
    storeFilter.deleted = 0;
    const result = await Discount.findOne(storeFilter).sort({
      _id: "desc",
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
