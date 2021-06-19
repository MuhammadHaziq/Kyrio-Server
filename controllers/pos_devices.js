import express from "express";
import POS_Device from "../modals/POS_Device";
import Shifts from "../modals/employee/shifts";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, store } = req.body;
  // let jsonStore = JSON.parse(store);
  const { _id, account } = req.authData;

  let result = await POS_Device.find({ store: store })
    .sort({ deviceNo: -1 })
    .limit(1);
  let deviceNo =
    typeof result[0] !== "undefined" ? parseInt(result[0].deviceNo) + 1 : 1;

  const newPOSDevice = new POS_Device({
    title: title,
    deviceNo: deviceNo,
    noOfSales: 0,
    store: store,
    createdBy: _id,
    account: account,
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
    const { _id, account } = req.authData;
    const result = await POS_Device.find({ account: account }).populate('store', ["_id","title"]).sort({
      _id: "desc",
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/getStoreDevice", async (req, res) => {
  try {
    const { _id, account } = req.authData;
    const { storeId, UDID } = req.body;

    let result = {};
    let condition = {};
    if (storeId === "0") {
      result = await POS_Device.findOne({ account: account, udid: UDID }).populate('store', ["_id","title"]);
      if (result == null) {
        result = await POS_Device.findOne({
          account: account,
          isActive: false,
        }).populate('store', ["_id","title"]);
      }
    } else {
      result = await POS_Device.findOne({
        "store": storeId,
        udid: UDID,
      }).populate('store', ["_id","title"]);
      if (result == null) {
        result = await POS_Device.findOne({
          "store": storeId,
          isActive: false,
        }).populate('store', ["_id","title"]);
      }
    }

    if (result !== null) {
      result = await POS_Device.findByIdAndUpdate(
        { _id: result._id },
        {
          $set: {
            isActive: true,
            udid: UDID,
          },
        }
      ).populate('store', ["_id","title"]);
      var shift = await Shifts.findOne({
        pos_device_id: result._id,
        closed_at: null,
        account: account,
      });
      if (shift) {
        res.status(200).json({ device: result, openShift: shift });
      } else {
        res.status(200).json({ device: result, openShift: null });
      }
    } else {
      res
        .status(200)
        .json({ message: "Please create POS device for this store!" });
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
router.get("/row/:id", async (req, res) => {
  try {
    // display only login user pos Devices
    const { _id, account } = req.authData;
    const { id } = req.params;
    const result = await POS_Device.findOne({
      account: account,
      _id: id,
    }).populate('store', ["_id","title"]).sort({
      _id: "desc",
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
