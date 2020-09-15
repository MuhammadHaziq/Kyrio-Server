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
    paymentTypes = JSON.parse(paymentTypes);
    if (paymentTypes["paymentTypeId"] === 0) {
      errors.push(`Select Payment Type!`);
    }
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id } = req.authData;
    const newPaymentsTypes = new paymentsType({
      name: name,
      paymentTypes: paymentTypes,
      storeId: storeId,
      createdBy: _id,
    });
    try {
      const result = await newPaymentsTypes.save();

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/", async (req, res) => {
  try {
    const { storeId } = req.query;
    const { _id } = req.authData;
    const result = await paymentsType
      .find({ createdBy: _id, storeId: storeId })
      .sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
