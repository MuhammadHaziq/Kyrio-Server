import express from "express";
import POS_Device from "../modals/POS_Device";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, store } = req.body;
  let jsonStore = JSON.parse(store);
  const { _id } = req.authData;

  const newPOSDevice = new POS_Device({
    title: title,
    store: jsonStore,
    createdBy: _id,
  });
  try {
    const result = await newPOSDevice.save();
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "POS Device Already Register In Store" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/", async (req, res) => {
  try {
    // display only login user pos Devices
    const { _id } = req.authData;
    const result = await POS_Device.find({ createdBy: _id }).sort({
      _id: "desc",
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/getStoreDevice", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { storeId } = req.body;
    let result = {};
    let condition = {};
    if (storeId === "0") {
      result = await POS_Device.findOne({ createdBy: _id });
    } else {
      result = await POS_Device.findOne({
        "store.storeId": storeId,
        createdBy: _id,
      });
    }
    // const result = await POS_Device.findOne({ "store.storeId": storeId, createdBy: _id , isActive: false});

    if (result !== null) {
      await POS_Device.updateOne(
        { _id: result._id },
        {
          $set: {
            isActive: true,
          },
        }
      );
      res.status(200).json(result);
    } else {
      res
        .status(200)
        .json({ message: "Please create POS device for this store!" });
      // res.status(400).send({//   message:
      //     "POS Device is not available! Please create a POS Device in this Store from backoffice",
      // });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:ids", async (req, res) => {
  try {
    var { ids } = req.params;
    ids = JSON.parse(ids);
    ids.forEach(async (id) => {
      await POS_Device.deleteOne({ _id: id });
    });

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const { title, store } = req.body;
    // let jsonStore = JSON.parse(store);
    const { id } = req.params;

    await POS_Device.updateOne(
      { _id: id },
      {
        $set: {
          title: title,
        },
      }
    );

    res.status(200).json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/activate/:id", async (req, res) => {
  try {
    // const {title, store } = req.body;
    // let jsonStore = JSON.parse(store);
    const { id } = req.params;

    await POS_Device.updateOne(
      { _id: id },
      {
        $set: {
          isActive: true,
        },
      }
    );

    res.status(200).json({ message: "activated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
