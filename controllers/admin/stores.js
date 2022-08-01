import express from "express";

import Store from "../../modals/Store";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log(req.body);
    const result = await Store.find();
    let data = [];

    for (const store of result) {
      data.push({
        value: store._id,
        text: store.title,
      });
    }

    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

module.exports = router;
