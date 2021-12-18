import express from "express";
import Pages from "../../modals/pages/pages";
import Shifts from "../../modals/employee/shifts";
const router = express.Router();

router.post("/", async (req, res) => {
  const { pageData, store } = req.body;
  // let jsonStore = JSON.parse(store);
  const { _id, account } = req.authData;
  console.log(req.authData);
  if(pageData){
    // res.status(400).json({ message: "Please select store" });
    try {
      
        const newPage = new Pages({
          pageData: pageData,
          createdBy: _id,
          account: account,
        });
        const result = await newPage.save();
        const newRecord = await Pages.findOne({ account: account, _id: result._id }).populate('store', ["_id","title"]);
        res.status(200).json(newRecord);
    
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
    const result = await Pages.find({ createdBy: _id }).populate('store', ["_id","title"]).sort({
      _id: "desc",
    });
    res.status(200).json(result);
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
