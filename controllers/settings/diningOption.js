import express from "express";
import diningOption from "../../modals/settings/diningOption";
import Store from "../../modals/Store";

const router = express.Router();

router.post("/", async (req, res) => {
  const { title, store, isSelected } = req.body;
  
  const { _id, account } = req.authData;
  const countDining = await diningOption.countDocuments();
  let stores = [];
  store.map((item, index) => {
    return stores.push({
      store: item.storeId,
      position: countDining + 1,
      isActive: item.isActive,
    });
  });
  // console.log(stores);
  const newDiningOption = await new diningOption({
    title: title,
    stores: stores,
    createdBy: _id,
    account: account,
  });
  try {
    const insert = await newDiningOption.save();
    const result = await diningOption.findOne({ account: account, _id: insert._id }).populate('stores.store', ["_id","title"])
    res.status(200).json(result);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Dining Already Register In Store" });
    } else {
      res.status(400).json({ message: error.message });
    }
    // res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { account, stores, is_owner } = req.authData;
    let filter = { account: account }
    if(!is_owner){
      let storeIDList = []
      if(stores.length > 0){
        for(const str of stores){
          storeIDList.push(str._id)
        }
        filter._id = { $in : storeIDList }
      }
    }
    const storesList = await Store.find(filter).sort({
      _id: "desc",
    });
    
    let data = [];
    for (const store of storesList) {
      const result = await diningOption
        .find({
          account: account,
          $or: [{ stores: { $elemMatch: { store: store._id } } }, { stores: { $elemMatch: { storeId: store._id } } }],
        }).populate('stores.store', ["_id","title"])
        .sort({ _id: "asc" });
        
      data.push({
        storeId: store._id,
        storeName: store.title,
        data: result,
      });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/row/:id", async (req, res) => {
  try {
    const { _id, account } = req.authData;
    const { id } = req.params;
    const stores = await Store.find({ account: account }).sort({
      _id: "desc",
    });
    let data = [];
    for (const store of stores) {
      const result = await diningOption
        .findOne({
          _id: id,
          account: account
        }).populate('stores.store', ["_id","title"])
        .sort({ _id: "asc" });

      data.push({
        storeId: store._id,
        storeName: store.title,
        title: result.title !== undefined ? result.title : "",
        _id: result._id !== undefined ? result._id : "",
        account:
          result.account !== undefined ? result.account : "",
        createdBy:
          result.createdBy !== undefined ? result.createdBy : "",
        stores:
          result.stores !== undefined ? result.stores : "",
      });
    }
    if (data.length > 0) {
      data = data[0];
    } else {
      data = {};
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/app", async (req, res) => {
  try {
    const { storeId } = req.body;
    const { account } = req.authData;

    const store = await Store.findOne({ _id: storeId }).sort({ _id: "desc" });

    if (store !== null) {
      let result = [];
      var dinings = await diningOption.find({ account: account }).populate('stores.store', ["_id","title"]);

      for (const dine of dinings) {
        for (const dineStore of dine.stores) {
          if(dineStore.store){
          if (dineStore.store._id == storeId && dineStore.isActive) {
            result.push({
              _id: dine._id,
              title: dine.title,
              position: dineStore.position,
              isActive: dineStore.isActive,
            });
          }
        }
        }
      }
      result.sort(
        (positionA, positionB) =>
          parseFloat(positionA.position) - parseFloat(positionB.position)
      );
      res.status(200).json(result);
    } else {
      res.status(400).json({ message: "Store Not Found! Invalid Store ID" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/getStoreDining", async (req, res) => {
  try {
    const { storeId } = req.body;
    const { account, stores, is_owner } = req.authData;
    if (storeId === "0") {
      let filter = { account: account }
      if(!is_owner){
        let storeIDList = []
        if(stores.length > 0){
          for(const str of stores){
            storeIDList.push(str._id)
          }
          filter._id = { $in : storeIDList }
        }
      }
      const storesList = await Store.find(filter).sort({
        _id: "desc",
      });
      let data = [];
      for (const store of storesList) {
        const result = await diningOption
          .find({
            $or: [{ stores: { $elemMatch: { store: store._id } } }, { stores: { $elemMatch: { storeId: store._id } } }],
            account: account,
          }).populate('stores.store', ["_id","title"])
          .sort({ _id: "asc" });

        data.push({
          storeId: store._id,
          storeName: store.title,
          data: result,
        });
      }
      res.status(200).json(data);
    } else {
      const stores = await Store.find({
        _id: storeId,
        account: account,
      });
      let data = [];
      for (const store of stores) {
        const result = await diningOption
          .find({
            $or: [{ stores: { $elemMatch: { store: store._id } } }, { stores: { $elemMatch: { storeId: store._id } } }],
            account: account,
          }).populate('stores.store', ["_id","title"])
          .sort({ _id: "asc" });

        data.push({
          storeId: store._id,
          storeName: store.title,
          data: result,
        });
      }
      res.status(200).json(data);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
      await diningOption.deleteOne({
        _id: id,
      });

    res.status(200).json({ message: "Dining Option Deleted Successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/", async (req, res) => {
  try {
    const { id, title, store, isSelected } = req.body;
    const { account } = req.authData;
    let jsonStore = JSON.parse(store);
    const countDining = await diningOption.countDocuments();
   
    let stores = [];
    jsonStore.map((item, index) => {
      return stores.push({
        store: item.storeId,
        position: countDining + 1,
        isActive: item.isActive,
      });
    });
    const { _id } = req.authData;
    const result = await diningOption.findOneAndUpdate(
      { _id: id, account: account },
      {
        $set: {
          title: title,
          stores: stores,
          createdBy: _id,
        },
      },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    ).populate('stores.store', ["_id","title"]);

    res.status(200).json({ message: "Dining Is Updated", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update_position", async (req, res) => {
  try {
    const { data, storeId } = req.body;
    await (data || []).map(async (item) => {
      await diningOption.updateOne(
        { _id: item._id, stores: { $elemMatch: { store: storeId } } },
        {
          $set: {
            "stores.$.position": item.position,
          },
        },
        {
          new: true,
          upsert: true, // Make this update into an upsert
        }
      );
    });

    res.status(200).json({ message: "Dining Position Is Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update_availabilty", async (req, res) => {
  try {
    const { data, storeId } = req.body;
    await (data || []).map(async (item) => {
      // { _id: item.id, stores: { $elemMatch: { storeId: storeId } } },
      const result = await diningOption.findOneAndUpdate(
        { _id: item._id, stores: { $elemMatch: { store: {$in: storeId } } } },
        {
          $set: {
            "stores.$.isActive": item.isActive,
          },
        },
        {
          new: true,
          upsert: true, // Make this update into an upsert
        }
      );
    });

    res.status(200).json({ message: "Dining Availablity Is Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
