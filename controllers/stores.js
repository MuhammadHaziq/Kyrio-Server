import express from "express";
import Store from "../modals/Store";
import Users from "../modals/users";
import ItemList from "../modals/items/ItemList";
import Modifier from "../modals/items/Modifier";
import Discount from "../modals/items/Discount";
import Tickets from "../modals/sales/tickets";
import POS_Device from "../modals/POS_Device";
import diningOption from "../modals/settings/diningOption";
import itemTax from "../modals/settings/taxes/itemTax";

const router = express.Router();

router.post("/", async (req, res) => {
  const { title, address, phone, description } = req.body;
  const { _id, owner_id, account } = req.authData;

  const newStore = new Store({
    title: title,
    address: address,
    phone: phone,
    description: description,
    createdBy: _id,
    account: account,
  });
  try {
    const result = await newStore.save();
    const store = await Store.find({ account: account })
      .select(["title"])
      .sort({ _id: "desc" });
    let storeData = [];
    store.map((item) => {
      return storeData.push({
        storeId: item._id,
        storeName: item.title,
      });
    });
    await diningOption.updateMany(
      {
        title: {
          $in: [
            process.env.DEFAULT_DINING_TITLE_1,
            process.env.DEFAULT_DINING_TITLE_2,
            process.env.DEFAULT_DINING_TITLE_3,
          ],
        },
        createdBy: _id,
        account: account,
      },
      {
        $set: {
          stores: storeData,
        },
      }
    );
  // Add store in Owner Stores list
  
  // let user = await Users.findOne({ _id: _id})
  // let stores = user.stores
  // stores.push(result._id)

  await Users.updateOne(
    {
      _id: owner_id,
      account: account,
    },
    { $push: { stores: result._id } }
  );

    res.status(200).json(result);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Store with such name already exists. Specify another." });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/", async (req, res) => {
  try {
    const { _id, account } = req.authData;

    // display only login user stores
    const stores = await Store.find({ account: account }).sort({
      _id: "desc",
    });
    let allStores = [];
    for (const store of stores) {
      let devices = await POS_Device.find({
        "store": store._id,
      }).countDocuments();
      allStores.push({
        _id: store._id,
        title: store.title,
        address: store.address,
        phone: store.phone,
        description: store.description,
        createdAt: store.createdAt,
        createdBy: store.createdBy,
        devices: devices,
      });
    }
    res.status(200).json(allStores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/row/:id", async (req, res) => {
  try {
    const { _id, account } = req.authData;
    const { id } = req.params;
    // display only login user stores
    const stores = await Store.find({ account: account, _id: id }).sort({
      _id: "desc",
    });
    let allStores = [];
    for (const store of stores) {
      let devices = await POS_Device.find({
        "store": store._id,
      }).countDocuments();
      allStores.push({
        _id: store._id,
        title: store.title,
        address: store.address,
        phone: store.phone,
        description: store.description,
        createdAt: store.createdAt,
        createdBy: store.createdBy,
        devices: devices,
      });
    }
    if (allStores.length > 0) {
      allStores = allStores[0];
    } else {
      allStores = {};
    }
    res.status(200).json(allStores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:ids", async (req, res) => {
  try {
    const { _id, account } = req.authData;
    var { ids } = req.params;
    let storeCount = await Store.find({
      account: account
    }).countDocuments();
    let message = [];
    let error = false

    if(storeCount > 1){
      // ids.forEach(async (id) => {
        let devices = await POS_Device.find({
          "store": ids,
        }).countDocuments();
        let result = await Store.findOne({ _id: ids }).sort({ _id: "desc" });
        if (devices === 0) {
          await Store.deleteOne({ _id: ids });
          if (result !== undefined || result !== null) {
            message.push({
              message: `This Store (${result.title}) Is Deleted Successfully`,
              error: false,
              storeId: ids,
            });
          }
        } else if(devices > 0) {
          if (result !== undefined || result !== null) {
            message.push({
              message: `You cannot delete the store that has at least one POS.`,
              error: true,
              storeId: ids,
            });
            error = true
          }
        }
      if(!error){
        const store = await Store.find({ account: account })
          .select(["title"])
          .sort({ _id: "desc" });
        let storeData = [];
        store.map((item) => {
          return storeData.push({
            storeId: item._id,
            storeName: item.title,
          });
        });
        await diningOption.updateMany(
          {
            title: {
              $in: [
                process.env.DEFAULT_DINING_TITLE_1,
                process.env.DEFAULT_DINING_TITLE_2,
                process.env.DEFAULT_DINING_TITLE_3,
              ],
            },
            createdBy: _id,
            account: account,
          },
          {
            $set: {
              stores: storeData,
            },
          }
        );
      }
    } else {
      message.push({
        message: `Main store cannot be deleted.`,
        error: true,
        storeId: ids,
      });
      error = true
    }

    if(!error){
      // Remove from Items
      await ItemList.updateMany(
        { account: account },
        { $pull: { stores: { store: { $in: [ ids ] } } } }
      )
      // Remove from modifiers
      await Modifier.updateMany(
        { account: account },
        { $pull: { stores: { $in: [ ids ] } } }
      )
      // Remove from discounts
      await Discount.updateMany(
        { account: account },
        { $pull: { stores: { $in: [ ids ] } } }
      )
      // Remove from Employees
      await Users.updateMany(
        { account: account },
        { $pull: { stores: { $in: [ ids ] } } }
      )
      // Remove from itemTax
      await itemTax.updateMany(
        { account: account },
        { $pull: { stores: { $in: [ ids ] } } }
      )
      // Delete open tickets 
      await Tickets.deleteOne({ account: account, store: ids })
    }

    res.status(200).json({ message: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const { title, address, phone, description } = req.body;
    const { id } = req.params;

    await Store.updateOne(
      { _id: id },
      {
        $set: {
          title: title,
          address: address,
          phone: phone,
          description: description,
        },
      }
    );

    res.status(200).json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
