import express from "express";
import POS_Device from "../modals/POS_Device";
import Shifts from "../modals/employee/shifts";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, store } = req.body;
  // let jsonStore = JSON.parse(store);
  const { _id, account } = req.authData;

  if (store == "0") {
    res.status(400).json({ message: "Please select store" });
  } else {
    let result = await POS_Device.find({ store: store })
      .sort({ deviceNo: -1 })
      .limit(1);
    let deviceNo =
      typeof result[0] !== "undefined" ? parseInt(result[0].deviceNo) + 1 : 1;

    try {
      const newPOSDevice = new POS_Device({
        title: title,
        deviceNo: deviceNo,
        noOfSales: 0,
        store: store,
        createdBy: _id,
        account: account,
      });
      const result = await newPOSDevice.save();
      const newRecord = await POS_Device.findOne({
        account: account,
        _id: result._id,
      }).populate("store", ["_id", "title"]);
      res.status(200).json(newRecord);
    } catch (error) {
      if (error.code === 11000) {
        res
          .status(400)
          .json({ message: "POS Device Already Register In Store" });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
});
router.get("/", async (req, res) => {
  try {
    // display only login user pos Devices
    const { account, stores, is_owner } = req.authData;
    let filter = { account: account }
    if(!is_owner){
      let storeIDList = []
      if(stores.length > 0){
        for(const str of stores){
          storeIDList.push(str._id)
        }
        filter.store = { $in : storeIDList }
      }
    }
    
    const result = await POS_Device.find(filter)
      .populate("store", ["_id", "title"])
      .sort({
        _id: "desc",
      });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/getStoreDeviceByFilter", async (req, res) => {
  try {
    const { storeId } = req.body;
    const { account, stores } = req.authData;
    let filter = { account: account }
    if(storeId == "0"){
      let storeIDList = []
      if(stores.length > 0){
        for(const str of stores){
          storeIDList.push(str._id)
        }
        filter.store = { $in : storeIDList }
      }
    } else {
      filter.store = storeId
    }
    let devices = await POS_Device.find(filter).populate("store", ["_id", "title"]).sort({
      _id: "desc",
    });
    res.status(200).json({ devices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/getStoreDevice", async (req, res) => {
  try {
    const { _id, account } = req.authData;
    const { storeId, UDID } = req.body;
    if (UDID != "") {
      let result = {};
      if (storeId === "0") {
        result = await POS_Device.findOne({
          account: account,
          udid: UDID,
        }).populate("store", ["_id", "title"]);
        if (result == null) {
          result = await POS_Device.findOne({
            account: account,
            isActive: false,
          }).populate("store", ["_id", "title"]);
        }
      } else {
        result = await POS_Device.findOne({
          store: storeId,
          udid: UDID,
        }).populate("store", ["_id", "title"]);
        if (result == null) {
          result = await POS_Device.findOne({
            store: storeId,
            isActive: false,
          }).populate("store", ["_id", "title"]);
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
        ).populate("store", ["_id", "title"]);
        var shift = await Shifts.findOne({
          pos_device: result._id,
          closed_at: null,
          account: account,
        }).populate("store", ["_id", "title"])
        .populate("opened_by_employee", ["_id", "name"])
        .populate("pos_device", ["_id", "title"])
        .populate("createdBy", ["_id", "name"]);
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
    } else {
      res.status(200).json({ message: "Invalid UDID!" });
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
    })
      .populate("store", ["_id", "title"])
      .sort({
        _id: "desc",
      });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
