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
  const { _id, account } = req.authData;
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
            account: account,
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
        account: account
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
    const { _id, account } = req.authData;
    const stores = await Store.find({ account: account }).sort({ _id: "desc" });
    let data = [];
    for (const store of stores) {
      const result = await diningOption2
        .find({
          account: account,
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
    const { _id, account } = req.authData;
    const { storeId } = req.body;
    // let filter = {};
    if (storeId === "0") {
      const stores = await Store.find({ account: account }).sort({ _id: "desc" });
      let data = [];
      for (const store of stores) {
        const result = await diningOption2
          .find({
            account: account,
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
        account: account,
      });
      let data = [];
      for (const store of stores) {
        const result = await diningOption2
          .find({
            account: account,
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
    var { stores, title } = req.body;
    const { _id } = req.params;
    for (const item of JSON.parse(stores)) {
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
                  title: { $regex: `^${title}$`, $options: "i" },
                },
              },
            },
            { safe: true, multi: false }
          );
        } else {
          await diningOption2.deleteOne({
            storeId: item.storeId,
            diningOptions: {
              $elemMatch: {
                title: { $regex: `^${title}$`, $options: "i" },
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
    const { title, stores, select_store_id } = req.body;
    let jsonStore = JSON.parse(stores);
    let updateDining = [];
    const { _id, account } = req.authData;
    for (const item of jsonStore) {
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
    if (select_store_id === "0") {
      const stores = await Store.find({ account: account }).sort({ _id: "desc" });
      let data = [];
      for (const store of stores) {
        const result = await diningOption2
          .find({
            account: account,
            storeId: store._id,
          })
          .sort({ _id: "asc" });

        if (result.length > 0) {
          data.push(result[0]);
        }
      }
      res.status(200).json({ message: "Dining Is Updated", data: data });
    } else {
      const stores = await Store.find({
        _id: storeId,
        account: account,
      });
      let data = [];
      for (const store of stores) {
        const result = await diningOption2
          .find({
            account: account,
            storeId: store._id,
          })
          .sort({ _id: "asc" });

        data.push(result[0]);
      }
      res.status(200).json({ message: "Dining Is Updated", data: data });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update_position", async (req, res) => {
  try {
    let { data, storeId } = req.body;
    data = JSON.parse(data);
    const { _id, account } = req.authData;
    await (data || []).map(async (item) => {
      const result = await diningOption2.findOneAndUpdate(
        { storeId: storeId, "diningOptions._id": item.id },
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
    let { data, storeId } = req.body;
    data = JSON.parse(data);
    await (data || []).map(async (item) => {
      const result = await diningOption2.findOneAndUpdate(
        { storeId: storeId, "diningOptions._id": item._id },
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
