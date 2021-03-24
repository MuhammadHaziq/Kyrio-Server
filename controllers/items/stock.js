import express from "express";
import Stock from "../../modals/items/stock";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { accountId } = req.authData;
    await Stock.find({ accountId: accountId }, (err, result) => {
      if (err) {
        conosle.log("Get Stock Error", err.message);
      }
      res.status(200).json(result);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { stockTitle } = req.body;
    const { _id, accountId } = req.authData;
    const newStcokItem = new Stock({
      stockTitle,
      created_by: _id,
      accountId: accountId,
    });

    const result = await newStcokItem.save();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
