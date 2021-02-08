import express from "express";
import Modifier from "../../modals/items/Modifier";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, type, options, stores } = req.body;
  try {
    var typeName = type !== undefined ? type : "";
    var jsonOptions =
      typeof options !== "undefined" && options.length > 0
        ? JSON.parse(options)
        : [];
    var jsonStores =
      typeof stores !== "undefined" && stores.length > 0
        ? JSON.parse(stores)
        : [];
    const { _id, accountId } = req.authData;
    const countModifier = await Modifier.countDocuments();
    const newModifier = new Modifier({
      title: title,
      accountId: accountId,
      type: typeName,
      options: jsonOptions,
      stores: jsonStores,
      position: countModifier + 1,
      created_by: _id,
    });
    const result = await newModifier.save();
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Modifier Already Register" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/:storeId", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const { storeId } = req.params;
    let storeFilter = {};
    if (storeId !== "0") {
      storeFilter.stores = { $elemMatch: { id: storeId } };
    }
    storeFilter.accountId = accountId;
    // const result = await Modifier.find({
    //   stores: { $elemMatch: { id: storeId } },
    //   created_by: _id,
    // }).sort({ _id: "desc" });
    const result = await Modifier.find(storeFilter).sort({ position: "asc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/getStoreModifiers", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const { storeId } = req.body;
    const result = await Modifier.find({
      stores: { $elemMatch: { id: storeId } },
      accountId: accountId,
    }).sort({ postion: "asc" });
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
      await Modifier.deleteOne({ _id: id });
    });

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update_position", async (req, res) => {
  try {
    let { data } = req.body;
    data = JSON.parse(data);
    await (data || []).map(async (item) => {
      const result = await Modifier.findOneAndUpdate(
        { _id: item.id },
        {
          $set: {
            position: item.position,
          },
        },
        {
          new: true,
          upsert: true, // Make this update into an upsert
        }
      );
    });

    res.status(200).json({ message: "Modifier Position Is Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { title, options, stores } = req.body;
    var jsonOptions = JSON.parse(options);
    let jsonStores = JSON.parse(stores);
    const { id } = req.params;

    const result = await Modifier.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          title: title,
          options: jsonOptions,
          stores: jsonStores,
        },
      },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    );

    res.status(200).json({ message: "Modifier Updated", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
