import express from "express";
import settingsLoyalty from "../../modals/settings/loyalty";
const router = express.Router();

router.post("/", async (req, res) => {
  const { loyalty_amount, storeId } = req.body;
  const { _id } = req.authData;
  var errors = [];
  if (
    !loyalty_amount ||
    typeof loyalty_amount == "undefined" ||
    loyalty_amount == ""
  ) {
    errors.push(`Invalid Amount!`);
    // errors.push({ name: `Invalid Name!` });
  }
  if (!storeId || typeof storeId == "undefined" || storeId == "") {
    errors.push(`Invalid Store Id!`);
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const newSettingsLoyalty = new settingsLoyalty({
      amount: loyalty_amount,
      storeId: storeId,
      createdBy: _id,
    });
    try {
      const result = await newSettingsLoyalty.save();
      const data = {
        status: true,
        data: result["amount"],
      };
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/:storeId", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { storeId } = req.params;
    const result = await settingsLoyalty
      .findOne({ createdBy: _id, storeId: storeId })
      .sort({ _id: "desc" })
      .limit(1); // Find Lasted One Record
    const data = {
      status: true,
      data: result !== null ? result["amount"] : "00.0",
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
