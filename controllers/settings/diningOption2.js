import express from "express";
import diningOption2 from "../../modals/settings/diningOption2";
import Store from "../../modals/Store";
import { removeSpaces } from "../../function/validateFunctions";
const router = express.Router();

router.post("/", async (req, res) => {
  const { store, isSelected } = req.body;
  let { title } = req.body;
  if (title) {
    title = removeSpaces(title);
  }
  const jsonStore = JSON.parse(store);
  const { _id } = req.authData;
  let errors = [];
  let stores = [];
  let newInserted = [];
  for (const item of jsonStore) {
    const result = await diningOption2.find({ storeId: item.storeId });
    if (result.length > 0) {
      const data = {
        title: title,
        position: result.map((ite) => {
          return ite.diningOptions.length + 1;
        })[0],
        isActive: item.isActive,
      };
      try {
        const updateDining = await diningOption2.updateOne(
          { storeId: item.storeId },
          {
            $push: {
              diningOptions: [data],
            },
          }
        );
        const data1 = await diningOption2
          .find({
            createdBy: _id,
            storeId: item.storeId,
          })
          .sort({ _id: "asc" });
        newInserted.push(data1[0]);
      } catch (error) {
        if (error.code === 11000) {
          errors.push({
            message: `Dining Already Register In (${item.storeName}) Store`,
          });
        } else {
          errors.push({ message: error.message });
        }
      }
    } else if (result.length === 0) {
      let newDiningOption2 = new diningOption2({
        storeId: item.storeId,
        storeName: item.storeName,
        diningOptions: [
          {
            title: title,
            position: 1,
            isActive: item.isActive,
          },
        ],
        createdBy: _id,
      });
      try {
        const result = await newDiningOption2.save();
        newInserted.push(result);
      } catch (err) {
        if (err.code === 11000) {
          errors.push({
            message: `Dining Already Register In (${item.storeName}) Store`,
          });
        } else {
          errors.push({ message: err.message });
        }
      }
    }
  }
  res.status(200).send({ data: newInserted, error: errors });
});

router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    const stores = await Store.find({ createdBy: _id }).sort({ _id: "desc" });
    let data = [];
    for (const store of stores) {
      const result = await diningOption2
        .find({
          createdBy: _id,
          storeId: store._id,
        })
        .sort({ _id: "asc" });
      if (result.length > 0) {
        data.push(result[0]);
      }
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/getStoreDining", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { storeId } = req.body;
    // let filter = {};
    if (storeId === "0") {
      const stores = await Store.find({ createdBy: _id }).sort({ _id: "desc" });
      let data = [];
      for (const store of stores) {
        const result = await diningOption2
          .find({
            createdBy: _id,
            storeId: store._id,
          })
          .sort({ _id: "asc" });

        if (result.length > 0) {
          data.push(result[0]);
        }
      }
      res.status(200).json(data);
    } else {
      const stores = await Store.find({
        _id: storeId,
        createdBy: _id,
      });
      let data = [];
      for (const store of stores) {
        const result = await diningOption2
          .find({
            createdBy: _id,
            storeId: store._id,
          })
          .sort({ _id: "asc" });

        data.push(result[0]);
      }
      res.status(200).json(data);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    var { data } = req.body;
    const { _id } = req.params;
    for (const item of JSON.parse(data)) {
      const result = await diningOption2
        .find({
          storeId: item.storeId,
        })
        .sort({ _id: "asc" });
      if (result.length > 0) {
        if (result[0].diningOptions.length > 1) {
          await diningOption2.updateOne(
            { storeId: item.storeId },
            {
              $pull: {
                diningOptions: {
                  title: { $regex: `^${item.title}$`, $options: "i" },
                },
              },
            },
            { safe: true, multi: false },
            function (err, obj) {
              //do something smart
              console.log(obj);
            }
          );
        } else {
          await diningOption2.deleteOne({
            storeId: item.storeId,
            diningOptions: {
              $elemMatch: {
                title: { $regex: `^${item.title}$`, $options: "i" },
              },
            },
          });
        }
      }
    }
    res.status(200).json({ message: "Dining Option Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/", async (req, res) => {
  try {
    const { title, stores } = req.body;
    console.log(title);
    let jsonStore = JSON.parse(stores);
    let updateDining = [];
    const { _id } = req.authData;
    for (const item of jsonStore) {
      console.log("item", item);
      const result = await diningOption2.updateOne(
        {
          storeId: item.storeId,
          "diningOptions._id": item.id,
        },
        {
          $set: {
            "diningOptions.$.title": title,
            "diningOptions.$.isActive": item.isSelected,
          },
        },
        { safe: true },
        function (err, response) {
          if (response !== null) {
            updateDining.push(response);
          }
        }
      );
    }
    res.status(200).json({ message: "Dining Is Updated", data: updateDining });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update_position", async (req, res) => {
  try {
    let { data, storeId, diningId } = req.body;
    data = JSON.parse(data);
    const { _id } = req.authData;
    await (data || []).map(async (item) => {
      const result = await diningOption2.findOneAndUpdate(
        { _id: diningId, storeId: storeId, "diningOptions._id": item._id },
        {
          $set: {
            "diningOptions.$.position": item.position,
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
    let { data, storeId, diningId } = req.body;
    data = JSON.parse(data);
    const { _id } = req.authData;
    await (data || []).map(async (item) => {
      const result = await diningOption2.findOneAndUpdate(
        { _id: diningId, storeId: storeId, "diningOptions._id": item._id },
        {
          $set: {
            "diningOptions.$.isActive": item.isActive,
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
