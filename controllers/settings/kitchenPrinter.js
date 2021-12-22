import express from "express";
import kitchenPrinter from "../../modals/settings/kitchenPrinter";
import {
  KITCHENP_INSERT,
  KITCHENP_UPDATE,
  KITCHENP_DELETE,
} from "../../sockets/events";
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
    req.io.to(account).emit(KITCHENP_INSERT, { data: result, user: _id });
    res.status(200).json(result);
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
    var { ids } = req.params;
    const { _id, account } = req.authData;
    ids = JSON.parse(ids);
    // for (const kitId of id) {
    //   await kitchenPrinter.deleteOne({ _id: kitId, account: account });
    // }
    // new

    let del = await kitchenPrinter.updateMany(
      { _id: { $in: ids }, account: account },
      { $set: { deleted: 1, deletedAt: Date.now() } },
      {
        new: true,
        upsert: true,
      }
    );

    if (del.n > 0 && del.nModified > 0) {
      req.io.to(account).emit(KITCHENP_DELETE, { data: ids, user: _id });
    }

    //new end
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/", async (req, res) => {
  try {
    const { id, title, categories 
      // storeId 
    } = req.body;
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
    req.io.to(account).emit(KITCHENP_UPDATE, { data: updatedRecord, user: _id });  
    res
      .status(200)
      .json({ message: "Kitchen Printer Is Updated", data: updatedRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
