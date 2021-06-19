import express from "express";
import paymentTypes from "../../../modals/settings/paymentTypes/paymentTypes";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title } = req.body;
  const { _id, account } = req.authData;

  const newPaymentTypes = new paymentTypes({
    title: title,
    createdBy: _id,
    account: account,
  });
  try {
    const result = await newPaymentTypes.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { account } = req.authData;
    const result = await paymentTypes.find({
      account: account,
      title: { $ne: "Cash" },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    await paymentTypes.deleteOne({ _id: id });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
