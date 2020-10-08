import express from "express";
import Store from "../modals/Store";
import POS_Device from "../modals/POS_Device";
import diningOption from "../modals/settings/diningOption";

const router = express.Router();

router.post("/", async (req, res) => {
  const { title, address, phone, description } = req.body;
  const { _id } = req.authData;

  const newStore = new Store({
    title: title,
    address: address,
    phone: phone,
    description: description,
    createdBy: _id,
  });
  try {
    const result = await newStore.save();
    await diningOption
      .create(
        [
          {
            title: "Dine in",
            stores: [{ storeId: result._id, storeName: result.title }],
            createdBy: _id,
          },
          {
            title: "Delivery",
            stores: [{ storeId: result._id, storeName: result.title }],
            createdBy: _id,
          },
          {
            title: "Takeout",
            stores: [{ storeId: result._id, storeName: result.title }],
            createdBy: _id,
          },
        ],
        { oneOperation: true }
      )
      .then((response) => {
        res.status(201).json(result);

        console.log("Default Dining Insert");
      })
      .catch((err) => {
        res.status(400).json({ message: error.message });
        console.log("Default Dining Insert Error", err.message);
      });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Store Already Register By This User" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;

    // display only login user stores
    const stores = await Store.find({ createdBy: _id }).sort({ _id: "desc" });
    let allStores = [];
    for (const store of stores) {
      let devices = await POS_Device.find({
        "store.storeId": store._id,
      }).countDocuments();
      allStores.push({
        _id: store._id,
        title: store.title,
        address: store.address,
        phone: store.phone,
        description: store.description,
        createdAt: store.createdAt,
        createdBy: store.createdBy,
        devices: devices,
      });
    }
    res.status(200).json(allStores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:ids", async (req, res) => {
  try {
    var { ids } = req.params;
    let message = [];
    ids = JSON.parse(ids);
    // ids.forEach(async (id) => {
    for (const id of ids) {
      let devices = await POS_Device.find({
        "store.storeId": id,
      }).countDocuments();
      let result = await Store.findOne({ _id: id }).sort({ _id: "desc" });
      if (devices === 0) {
        await Store.deleteOne({ _id: id });
        if (result !== undefined || result !== null) {
          message.push({
            message: `This Store (${result.title}) Is Deleted Successfully`,
            error: false,
            storeId: id,
          });
        }
      } else {
        if (result !== undefined || result !== null) {
          message.push({
            message: `This Store (${result.title}) Use In POS Device`,
            error: true,
            storeId: id,
          });
        }
      }
    }

    res.status(200).json({ message: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const { title, address, phone, description } = req.body;
    const { id } = req.params;

    await Store.updateOne(
      { _id: id },
      {
        $set: {
          title: title,
          address: address,
          phone: phone,
          description: description,
        },
      }
    );

    res.status(200).json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
