import express from "express";
import Modifier from "../../modals/items/Modifier";
import ItemList from "../../modals/items/ItemList";
import {
  MODIFIER_INSERT,
  MODIFIER_UPDATE,
  MODIFIER_DELETE,
} from "../../sockets/events";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, type, options, stores } = req.body;
  try {
    var typeName = type !== undefined ? type : "";
    var jsonOptions =
      typeof options !== "undefined" && options.length > 0 ? options : [];
    var jsonStores =
      typeof stores !== "undefined" && stores.length > 0 ? stores : [];
    const { _id, account } = req.authData;
    let modifier = await Modifier.findOne({
      title: title,
      account: account,
      deleted: 0,
    });
    
    if (!modifier) {
      const countModifier = await Modifier.countDocuments();
      const newModifier = new Modifier({
        title: title,
        account: account,
        type: typeName,
        options: jsonOptions,
        stores: jsonStores,
        position: countModifier + 1,
        createdBy: _id,
      });
      const result = await newModifier.save();

      req.io.to(account).emit(MODIFIER_INSERT, { data: result, user: _id });

      res.status(200).json(result);
    } else {
      res.status(400).json({ message: "Modifier Already Register" });
    }
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Modifier Already Register" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.get("/:storeId", async (req, res) => {
  try {
    
    const { account, platform, stores, is_owner } = req.authData;
    const { storeId } = req.params;
    const { update_at } = req.query;
    let storeFilter = {};
    if (storeId !== "0") {
      storeFilter.stores = { $in: storeId };
    } else {
      if(!is_owner){
        let storeIDList = []
        if(stores.length > 0){
          for(const str of stores){
            storeIDList.push(str._id)
          }
          storeFilter.stores = { $in: storeIDList };
        }
      }
    }
    storeFilter.account = account;
    storeFilter.deleted = 0;

    let isoDate = new Date(update_at);
    if (platform === "pos") {
      storeFilter.updatedAt = { $gte: isoDate };
    }
    const result = await Modifier.find(storeFilter)
      .populate("stores", ["_id", "title"])
      .sort({ position: 1 });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/getStoreModifiers", async (req, res) => {
  try {
    const { account } = req.authData;
    const { storeId } = req.body;
    const result = await Modifier.find({
      stores: { $in: storeId },
      account: account,
      deleted: 0,
    })
      .populate("stores", ["_id", "title"])
      .sort({ postion: "asc" });
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

    let del = await Modifier.updateMany(
      { _id: { $in: ids }, account: account },
      { $set: { deleted: 1, deletedAt: Date.now() } },
      {
        new: true,
        upsert: true,
      }
    );
    await ItemList.updateMany(
      { account: account },
      { $pull: { modifiers: { $in: [ids] } } }
    );
    if (del.n > 0 && del.nModified > 0) {
      req.io.to(account).emit(MODIFIER_DELETE, { data: ids, user: _id });
    }

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update_position", async (req, res) => {
  try {
    let { modifier } = req.body;
    const { _id, account } = req.authData;
    await (modifier || []).map(async (item) => {
      const result = await Modifier.findOneAndUpdate(
        { _id: item.id, account: account },
        {
          $set: {
            position: item.position,
          },
        },
        {
          new: true,
          upsert: true, // Make this update into an upsert
        }
      );
    });

    let modifiersUpdated = await Modifier.find({ account: account })
      .populate("stores", ["_id", "title"])
      .sort({
        position: "asc",
      });
    req.io
      .to(account)
      .emit(MODIFIER_UPDATE, { data: modifiersUpdated, user: _id });

    res.status(200).json({ message: "Modifier Position Is Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/", async (req, res) => {
  try {
    const { id, title, options, stores } = req.body;
    const { _id, account } = req.authData;
    let modifier = await Modifier.findOne({
      _id: { $ne: id },
      title: title,
      account: account,
      deleted: 0,
    });
    if (!modifier) {
      const result = await Modifier.findOneAndUpdate(
        { _id: id, account: account },
        {
          $set: {
            title: title,
            options: options,
            stores: stores,
          },
        },
        {
          new: true,
          upsert: true, // Make this update into an upsert
        }
      )
        .populate("stores", ["_id", "title"])
        .sort({ position: 1 });
        const appResponse = await Modifier.findOne(
          { _id: result._id })
          .sort({ position: 1 });
      req.io.to(account).emit(MODIFIER_UPDATE, { data: appResponse, user: _id });

      res.status(200).json(result);
    } else {
      res.status(400).json({ message: "Modifier Already Register" });
    }
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
    const result = await Modifier.findOne(storeFilter)
      .populate("stores", ["_id", "title"])
      .sort({
        position: "asc",
      });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
