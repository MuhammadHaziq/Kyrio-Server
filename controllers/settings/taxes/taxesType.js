import express from "express";
import taxesType from "../../../modals/settings/taxes/taxesType";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title } = req.body;
  const { _id, accountId } = req.authData;

  const newTaxesType = new taxesType({
    title: title,
    createdBy: _id,
    accountId: accountId
  });
  try {
    const result = await newTaxesType.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { _id, accountId } = req.authData;
    const result = await taxesType.find({ accountId: accountId});
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    await taxesType.deleteOne({ _id: id });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
