import express from "express";
import paymentMethods from "../../../modals/settings/paymentTypes/paymentMethods";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title } = req.body;
  const { _id, account } = req.authData;

  const newPaymentTypes = new paymentMethods({
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
    const { _id, account } = req.authData;
    
    const result = await paymentMethods.find({
      account: account,
      title: { $ne: "Cash" },
    });
    if(result.length > 0){
      res.status(200).json(result);
    } else {
      await paymentMethods
        .create([
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_1,
            createdBy: _id,
            account: account
          },
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_2,
            createdBy: _id,
            account: account
          },
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_3,
            createdBy: _id,
            account: account
          },
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_4,
            createdBy: _id,
            account: account
          },
        ]);
        const result = await paymentMethods.find({
          account: account,
          title: { $ne: "Cash" },
        });
        res.status(200).json(result);
    }
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    await paymentMethods.deleteOne({ _id: id });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
