import express from "express";
import Pages from "../../modals/pages/pages";
import Shifts from "../../modals/employee/shifts";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.post("/", async (req, res) => {
  const { pageData, storeId } = req.body;
  // let jsonStore = JSON.parse(store);
  const { _id, account } = req.authData;
  if(pageData){
    try {
      let result = {}
      const alreadyExist = await Pages.findOne({ account: account, store: storeId })
      if(alreadyExist){
        result = await Pages.findOneAndUpdate(
          { account: account, _id: alreadyExist._id },
          {
            $set: {
              store: ObjectId.isValid(storeId) ? storeId : null,
              pageData: pageData,
            },
          },
          {
            new: true,
            upsert: true, // Make this update into an upsert
          }
        );
      } else {
        let newResult = await new Pages({
          pageData: pageData,
          store: ObjectId.isValid(storeId) ? storeId : null,
          createdBy: _id,
          account: account,
        }).save();
        result = await Pages.findOne({ account: account, _id: newResult._id }).populate('store', ["_id","title"]);
      }
        
        res.status(200).json(result);
    
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: "Page Allready exist" });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
});
router.get("/", async (req, res) => {
  try {
    // display only login user pos Devices
    const { _id, account } = req.authData;
    const result = await Pages.findOne({ account: account, createdBy: _id }).populate('store', ["_id","title"]).sort({
      _id: "desc",
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:storeId", async (req, res) => {
  try {
    // display only login user pos Devices
    const { storeId } = req.params;
    const { account } = req.authData;
    if(ObjectId.isValid(storeId)){
      let filter = { 
        account: account,
        store: storeId
      }
      const result = await Pages.findOne(filter).populate('store', ["_id","title"]).sort({
        _id: "desc",
      });
        res.status(200).json(result);
    } else {
      res.status(400).json({ message: 'Invalid Store ID' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/", async (req, res) => {
  try {
    const { _id, account } = req.authData;
    const { pageData } = req.body;
    const result = await Pages.findOneAndUpdate(
      { account: account, createdBy: _id },
      {
        $set: {
          pageData: pageData,
        },
      },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/", async (req, res) => {
  const { _id, account } = req.authData;
  try {
    await Pages.deleteOne({ createdBy: _id });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
