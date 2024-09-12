import express from "express";
import Loyalties from "../../modals/settings/loyalty";
const router = express.Router();

router.post("/", async (req, res) => {
  const { loyalty_amount } = req.body;
  const { _id, account } = req.authData;
  var errors = [];
  if (
    !loyalty_amount ||
    typeof loyalty_amount == "undefined" ||
    loyalty_amount == ""
  ) {
    errors.push(`Invalid Amount!`);
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    try {
      const checkLoyalty = await Loyalties.findOne({
        account: account,
      });
      var data = {};
      if (!checkLoyalty) {
        const newLoyalty = new Loyalties({
          amount: loyalty_amount,
          createdBy: _id,
          account: account,
        });
        const result = await newLoyalty.save();
        data = {
          status: true,
          data: result.amount,
        };
      } else {
        const updateLoyaty = await Loyalties.findOneAndUpdate(
          { _id: checkLoyalty._id },
          {
            amount: loyalty_amount,
          },
          {
            new: true,
            upsert: true, // Make this update into an upsert
          }
        );
        data = {
          status: true,
          data: updateLoyaty.amount,
        };
      }
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/", async (req, res) => {
  try {
    const { account } = req.authData;
    const result = await Loyalties.findOne({
      account: account,
    });
    const data = {
      status: true,
      data: result !== null ? result.amount : "00.0",
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
