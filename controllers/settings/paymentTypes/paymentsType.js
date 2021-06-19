import express from "express";
import paymentsType from "../../../modals/settings/paymentTypes/paymentsType";
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, storeId } = req.body;
  let { paymentTypes } = req.body;

  var errors = [];
  if (!name || typeof name == "undefined" || name == "") {
    errors.push(`Invalid Name!`);
    // errors.push({ name: `Invalid Name!` });
  }
  if (!storeId || typeof storeId == "undefined" || storeId == "") {
    errors.push(`Invalid Store Id!`);
  }
  if (
    typeof paymentTypes === "undefined" ||
    !paymentTypes ||
    paymentTypes === ""
  ) {
    errors.push(`Invalid Payment Type!`);
  } else {
    if (paymentTypes.paymentTypeId === 0) {
      errors.push(`Select Payment Type!`);
    }
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id, account } = req.authData;
    const newPaymentsTypes = new paymentsType({
      name: name,
      paymentType: paymentTypes.paymentTypeId,
      store: storeId,
      createdBy: _id,
      account: account,
    });
    try {
      const insert = await newPaymentsTypes.save();
      const result = await paymentsType.findOne({ _id: insert._id }).populate('store', ["_id","title"]).populate('paymentType', ["_id","title"]);

      res.status(201).json(result);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: "Payment type Already Exist" });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
});
router.get("/", async (req, res) => {
  try {
    const { storeId } = req.query;
    const { account } = req.authData;
    const result = await paymentsType.find({
      account: account,
      store: storeId,
    }).populate('store', ["_id","title"]).populate('paymentType', ["_id","title"]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/row/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { account } = req.authData;
    const result = await paymentsType.findOne({
      account: account,
      _id: id,
    }).populate('store', ["_id","title"]).populate('paymentType', ["_id","title"]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { name, storeId, cashPaymentRound } = req.body;
  let { paymentTypes } = req.body;
  const { id } = req.params;
  let data = {};

  var errors = [];
  if (!name || typeof name == "undefined" || name == "") {
    errors.push(`Invalid Name!`);
    // errors.push({ name: `Invalid Name!` });
  }
  if (!storeId || typeof storeId == "undefined" || storeId == "") {
    errors.push(`Invalid Store Id!`);
  }
  if (
    typeof paymentTypes === "undefined" ||
    !paymentTypes ||
    paymentTypes === ""
  ) {
    errors.push(`Invalid Payment Type!`);
  } else {
    if (paymentTypes.paymentTypeId === 0) {
      errors.push(`Select Payment Type!`);
    }
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    if (req.body.cashPaymentRound !== undefined) {
      data = {
        name: name,
        paymentType: paymentTypes.paymentTypeId,
        cashPaymentRound: cashPaymentRound,
      };
    } else {
      data = {
        name: name,
        paymentType: paymentTypes.paymentTypeId,
      };
    }
    try {
      // { _id: id, storeId: storeId, createdBy: _id },
      const updatedRecord = await paymentsType.findOneAndUpdate(
        { _id: id, store: storeId },
        {
          $set: data,
        },
        {
          new: true,
          upsert: true, // Make this update into an upsert
        }
      ).populate('store', ["_id","title"]).populate('paymentType', ["_id","title"]);
      res
        .status(200)
        .json({ message: "Record Updated Successfully", data: updatedRecord });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    for (const paymentsId of JSON.parse(id)) {
      await paymentsType.deleteOne({ _id: paymentsId });
    }
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
