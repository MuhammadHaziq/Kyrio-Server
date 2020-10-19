import express from "express";
import Modifier from "../../modals/items/Modifier";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, type, options, stores } = req.body;
  try {
    var jsonOptions =
      typeof options !== "undefined" && options.length > 0
        ? JSON.parse(options)
        : [];
    var jsonStores =
      typeof stores !== "undefined" && stores.length > 0
        ? JSON.parse(stores)
        : [];
    const { _id } = req.authData;

    const newModifier = new Modifier({
      title: title,
      type: type,
      options: jsonOptions,
      stores: jsonStores,
      createdBy: _id,
    });
    const result = await newModifier.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/:storeId", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { storeId } = req.params;
    let storeFilter = {};
    if (storeId !== "0") {
      storeFilter.stores = { $elemMatch: { id: storeId } };
    }
    storeFilter.createdBy = _id;
    // const result = await Modifier.find({
    //   stores: { $elemMatch: { id: storeId } },
    //   createdBy: _id,
    // }).sort({ _id: "desc" });
    const result = await Modifier.find(storeFilter).sort({ position: "asc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/getStoreModifiers", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { storeId } = req.body;
    const result = await Modifier.find({
      stores: { $elemMatch: { id: storeId } },
      createdBy: _id,
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
    const { _id } = req.authData;
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

    await Modifier.updateOne(
      { _id: id },
      {
        $set: {
          title: title,
          options: jsonOptions,
          stores: jsonStores,
        },
      }
    );

    res.status(200).json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
