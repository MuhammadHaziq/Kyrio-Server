import express from "express";
import diningOption from "../../modals/settings/diningOption";
import Store from "../../modals/Store";

const router = express.Router();

router.post("/", async (req, res) => {
  const { title, store, isSelected } = req.body;
  let jsonStore = JSON.parse(store);
  const { _id } = req.authData;

  const newDiningOption = new diningOption({
    title: title,
    stores: jsonStore,
    createdBy: _id,
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
    const { _id } = req.authData;
    const stores = await Store.find({ createdBy: _id }).sort({ _id: "desc" });
    let data = [];
    for (const store of stores) {
      const result = await diningOption
        .find({
          createdBy: _id,
          stores: { $elemMatch: { storeId: store._id } },
        })
        .sort({ position: "asc" });
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
    const { _id } = req.authData;
    const { storeId } = req.body;
    // let filter = {};
    if (storeId === "0") {
      const stores = await Store.find({ createdBy: _id }).sort({ _id: "desc" });
      let data = [];
      for (const store of stores) {
        const result = await diningOption
          .find({
            stores: { $elemMatch: { storeId: store._id } },
            createdBy: _id,
          })
          .sort({ position: "asc" });
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
        createdBy: _id,
      });
      let data = [];
      for (const store of stores) {
        const result = await diningOption
          .find({
            stores: { $elemMatch: { storeId: store._id } },
            createdBy: _id,
          })
          .sort({ position: "asc" });
        data.push({
          storeId: store._id,
          storeName: store.title,
          data: result,
        });
      }
      res.status(200).json(data);
    }

    // if (storeId == 0) {
    //   filter = {
    //     createdBy: _id,
    //   };
    // } else {
    //   filter = {
    //     stores: { $elemMatch: { storeId: storeId } },
    //     createdBy: _id,
    //   };
    // }
    // // const result = await POS_Device.findOne({ "store.storeId": storeId, createdBy: _id , isActive: false});
    // const result = await diningOption.find(filter);
    //
    // res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    await diningOption.deleteOne({ _id: id });
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
    let { data } = req.body;
    data = JSON.parse(data);
    const { _id } = req.authData;
    await (data || []).map(async (item) => {
      const result = await diningOption.findOneAndUpdate(
        { _id: item.id },
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

    res.status(200).json({ message: "Dining Position Is Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update_availabilty", async (req, res) => {
  try {
    let { data } = req.body;
    data = JSON.parse(data);
    const { _id } = req.authData;
    await (data || []).map(async (item) => {
      const result = await diningOption.findOneAndUpdate(
        { _id: item.id },
        {
          $set: {
            isActive: item.isActive,
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
