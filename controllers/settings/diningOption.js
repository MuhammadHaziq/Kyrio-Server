import express from "express";
import diningOption from "../../modals/settings/diningOption";
import Store from "../../modals/Store";

const router = express.Router();

router.post("/", async (req, res) => {
  const { title, store, isSelected } = req.body;
  const jsonStore = JSON.parse(store);
  const { _id, accountId } = req.authData;
  const countDining = await diningOption.countDocuments();
  let stores = [];
  jsonStore.map((item, index) => {
    return stores.push({
      storeId: item.storeId,
      storeName: item.storeName,
      position: countDining + 1,
      isActive:item.isActive
    });
  });
  // console.log(stores);
  const newDiningOption = new diningOption({
    title: title,
    stores: stores,
    createdBy: _id,
    accountId: accountId
  });
  try {
    const result = await newDiningOption.save();

    res.status(201).json(result);
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
    const { _id, accountId } = req.authData;
    const stores = await Store.find({ accountId: accountId }).sort({ _id: "desc" });
    let data = [];
    for (const store of stores) {
      const result = await diningOption
        .find({
          accountId: accountId,
          stores: { $elemMatch: { storeId: store._id } },
        })
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

router.get("/app", async (req, res) => {
  try {
    const { _id, accountId } = req.authData;
    const stores = await Store.find({ accountId: accountId }).sort({ _id: "desc" });
    let data = [];
    for (const store of stores) {
      const result = await diningOption
        .find({
          accountId: accountId,
          stores: { $elemMatch: { storeId: store._id } },
        })
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

router.post("/getStoreDining", async (req, res) => {
  try {
    const { _id, accountId } = req.authData;
    const { storeId } = req.body;
    // let filter = {};
    if (storeId === "0") {
      const stores = await Store.find({ accountId: accountId }).sort({ _id: "desc" });
      let data = [];
      for (const store of stores) {
        const result = await diningOption
          .find({
            stores: { $elemMatch: { storeId: store._id } },
            accountId: accountId,
          })
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
        accountId: accountId,
      });
      let data = [];
      for (const store of stores) {
        const result = await diningOption
          .find({
            stores: { $elemMatch: { storeId: store._id } },
            accountId: accountId,
          })
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
    var { stores, checkAll } = req.body;
    if (checkAll === false) {
      if (stores !== undefined && stores !== null && stores.length > 0) {
        await diningOption.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              stores: JSON.parse(stores),
            },
          },
          {
            new: true,
            upsert: true, // Make this update into an upsert
          }
        );
      }
    } else {
      await diningOption.deleteOne({
        _id: id,
      });
    }

    res.status(200).json({ message: "Dining Option Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/", async (req, res) => {
  try {
    const { id, title, store, isSelected } = req.body;
    let jsonStore = JSON.parse(store);
    const { _id } = req.authData;
    const result = await diningOption.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          title: title,
          stores: jsonStore,
          createdBy: _id,
        },
      },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    );

    res.status(200).json({ message: "Dining Is Updated", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update_position", async (req, res) => {
  try {
    let { data, storeId } = req.body;
    data = JSON.parse(data);
    await (data || []).map(async (item) => {
      const result = await diningOption.findOneAndUpdate(
        { _id: item.id, stores: { $elemMatch: { storeId: storeId } } },
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
    let { data, storeId } = req.body;
    data = JSON.parse(data);
    await (data || []).map(async (item) => {
      // { _id: item.id, stores: { $elemMatch: { storeId: storeId } } },
      const result = await diningOption.findOneAndUpdate(
        { _id: item.id, stores: { $elemMatch: { storeId: storeId } } },
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
