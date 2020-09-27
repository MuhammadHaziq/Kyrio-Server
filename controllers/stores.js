import express from "express";
import Store from "../modals/Store";
import POS_Device from "../modals/POS_Device";
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
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    const result = await Store.find({ createdBy: _id }).sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:ids", async (req, res) => {
  try {
    var { ids } = req.params;
    ids = JSON.parse(ids);
    ids.forEach(async (id) => {
      await Store.deleteOne({ _id: id });
    });

    res.status(200).json({ message: "deleted" });
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
