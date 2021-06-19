import express from "express";
import Discount from "../../modals/items/Discount";
import { DISCOUNT_INSERT, DISCOUNT_UPDATE, DISCOUNT_DELETE } from "../../sockets/events";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, type, value, restricted } = req.body;
  const { _id, account } = req.authData;
  let { stores } = req.body;
  const newDiscount = new Discount({
    title: title,
    account: account,
    type: type,
    value: value,
    restricted: restricted,
    stores: stores,
    createdBy: _id,
  });
  try {
    const insert = await newDiscount.save();
    
    const result = await Discount.findOne({account: account, _id: insert._id}).populate('stores', ["_id","title"]).sort({
      title: 1,
    });
    req.io.to(account).emit(DISCOUNT_INSERT, {data: result, user: _id})
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
    const { account } = req.authData;
    const { storeId } = req.params;

    let storeFilter = {};
    if (storeId !== "0") {
      storeFilter.stores = { $elemMatch: { $in: storeId } };
    }
    storeFilter.account = account;
    storeFilter.deleted = 0;
    const result = await Discount.find(storeFilter).sort({
      title: 1,
    }).populate('stores', ["_id","title"]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:ids", async (req, res) => {
  try {
    var { ids } = req.params;
    const { _id, account } = req.authData;
    ids = JSON.parse(ids);

    let del = await Discount.updateMany({ _id: {$in: ids}, account: account }, { $set: {deleted: 1, deletedAt: Date.now() }}, {
      new: true,
      upsert: true,
    })

    if(del.n > 0 && del.nModified > 0){
      req.io.to(account).emit(DISCOUNT_DELETE, {data: ids, user: _id})
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
    const { _id, account } = req.authData;
    let { stores } = req.body;

    const result = await Discount.findOneAndUpdate(
      { _id: id, account: account },
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
    ).populate('stores', ["_id","title"]);
    req.io.to(account).emit(DISCOUNT_UPDATE, {data: result, user: _id})
    res.status(200).json({ data: result, message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/row/:id", async (req, res) => {
  try {
    const { account } = req.authData;
    const { id } = req.params;

    let storeFilter = {};
    storeFilter.account = account;
    storeFilter._id = id;
    storeFilter.deleted = 0;
    const result = await Discount.findOne(storeFilter).populate('stores', ["_id","title"]).sort({
      title: 1,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
