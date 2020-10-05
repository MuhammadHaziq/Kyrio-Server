import express from "express";
import diningOption from "../../modals/settings/diningOption";
import Store from "../../modals/Store";

const router = express.Router();

const get_dining_store_format = async (data, id) => {
  let storeFormat = [];
  // display only login user stores
  const stores = await Store.find({ createdBy: id }).sort({ id: "desc" });
  stores.map((item) => {
    storeFormat.push({
      storeId: item._id,
      storeName: item.title,
      data: data.filter((item) =>
        item.stores.map((str) => {
          str.storeId === item._id;
        })
      ),
    });
  });
  return storeFormat;
};

router.post("/", async (req, res) => {
  const { title, store, isSelected } = req.body;
  let jsonStore = JSON.parse(store);
  const { _id } = req.authData;

  const newDiningOption = new diningOption({
    title: title,
    stores: jsonStore,
    createdBy: _id,
  });
  try {
    const result = await newDiningOption.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    const result = await diningOption
      .find({ createdBy: _id })
      .sort({ position: "asc" });
    // get_dining_store_format(result, _id)
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((err) => {
    //     console.log(err.message);
    //   });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/getStoreDining", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { storeId } = req.body;
    let filter = {};
    if (storeId == 0) {
      filter = {
        createdBy: _id,
      };
    } else {
      filter = {
        stores: { $elemMatch: { storeId: storeId } },
        createdBy: _id,
      };
    }
    // const result = await POS_Device.findOne({ "store.storeId": storeId, createdBy: _id , isActive: false});
    const result = await diningOption.find(filter);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    await diningOption.deleteOne({ _id: id });
    res.status(200).json({ message: "Dining Option Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/", async (req, res) => {
  try {
    const { id, title, store, isSelected } = req.body;
    let jsonStore = JSON.parse(store);
    const { _id } = req.authData;
    const result = await diningOption.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          title: title,
          stores: jsonStore,
          createdBy: _id,
        },
      },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    );

    res.status(200).json({ message: "Dining Is Updated", data: result });
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
      const result = await diningOption.findOneAndUpdate(
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

    res.status(200).json({ message: "Dining Position Is Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update_availabilty", async (req, res) => {
  try {
    let { data } = req.body;
    data = JSON.parse(data);
    const { _id } = req.authData;
    await (data || []).map(async (item) => {
      const result = await diningOption.findOneAndUpdate(
        { _id: item.id },
        {
          $set: {
            isActive: item.isActive,
          },
        },
        {
          new: true,
          upsert: true, // Make this update into an upsert
        }
      );
    });

    res.status(200).json({ message: "Dining Availablity Is Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
