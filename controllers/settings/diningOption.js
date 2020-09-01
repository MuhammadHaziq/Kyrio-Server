import express from "express";
import diningOption from "../../modals/settings/diningOption";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, store } = req.body;
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
    res.status(400).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    const result = await diningOption.find({ createdBy: _id });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/getStoreDining", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { storeId } = req.body;
    // const result = await POS_Device.findOne({ "store.storeId": storeId, createdBy: _id , isActive: false});
    const result = await diningOption.find({
      stores: { $elemMatch: { storeId: storeId } },
      createdBy: _id,
    });

    i;
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    // ids = JSON.parse(id)
    // ids.forEach(async (id) => {
    await diningOption.deleteOne({ _id: id });
    // });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// router.patch('/:id', async (req, res) => {
//     try {
//         const {title, store } = req.body;
//         let jsonStore = JSON.parse(store);
//         const { id } = req.params;
//
//         await POS_Device.updateOne({ _id: id }, {
//             $set: {
//                 title: title,
//                 store: jsonStore
//             }
//         });
//
//         res.status(200).json({ message: "updated" });
//
//
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
//
// });

module.exports = router;
