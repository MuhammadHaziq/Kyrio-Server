import express from "express";
import itemTax from "../../../modals/settings/taxes/itemTax";
import diningOption from "../../../modals/settings/diningOption";
// import diningOption2 from "../../../modals/settings/diningOption2";
import Category from "../../../modals/items/category";
import ItemList from "../../../modals/items/ItemList";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, tax_rate, tex } = req.body;
  const { account, _id } = req.authData;
  let { tax_type, tax_option, stores, dinings, categories, items } = req.body;

  const newItemTax = new itemTax({
    title: title,
    tax_rate: tax_rate,
    account: account,
    tax_type: tax_type,
    tax_option: tax_option,
    stores: stores,
    dinings: dinings,
    categories: categories,
    items: items,
    createdBy: _id,
  });
  try {
    const result = await newItemTax.save();

    res.status(201).json(result);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Tax Name Already In Record" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.get("/", async (req, res) => {
  try {
    const { _id, account } = req.authData;
    const result = await itemTax
      .find({ account: account })
      .sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/row/:id", async (req, res) => {
  try {
    const { account } = req.authData;
    const { id } = req.params;
    const result = await itemTax
      .findOne({ account: account, _id: id })
      .sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/getStoreTaxes", async (req, res) => {
  try {
    const { account, platform } = req.authData;
    const { storeId } = req.body;
    const { update_at } = req.query;
    let filter = {};
    if (storeId == 0) {
      filter = {
        account: account,
      };
    } else {
      filter = {
        stores: { $in: storeId },
        account: account,
      };
    }
    
    let isoDate = new Date(update_at);
    if(platform === "pos"){
      filter.updatedAt = {$gte: isoDate}
    }
    const result = await itemTax.find(filter).populate('stores', ["_id","title"]).sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const { account } = req.authData;
    const allCat = await Category.find({ account: account }).sort({
      _id: "desc",
    });
    let allCategories = [];
    for (const cate of allCat) {
      allCategories.push({
        _id: cate._id,
        catTitle: cate.catTitle,
      });
    }
    allCategories.push({
      _id: "0",
      catTitle: "Uncategorized items",
    });
    res.status(200).json(allCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/getTaxDining", async (req, res) => {
  try {
    const { account } = req.authData;
    let { stores } = req.body;
    let filter = {};
    if (stores == 0) {
      filter = {
        account: account,
      };
    } else {
      console.log(stores)
      filter = {
        // stores: { $in: storeId},
        stores: { $elemMatch: { store: { $in: stores } } },
        account: account,
      };
    }
    // const result = await POS_Device.findOne({ "store.storeId": storeId, createdBy: _id , isActive: false});
    const result = await diningOption.find(filter).populate('stores.store', ["_id","title"]);

    if (result !== null && result !== undefined) {
      // Get Only Unique names
      // var unique = [...new Set(result.map((item) => item.title.toUpperCase()))];

      //  Get Unique Objects
      // var unique = result.filter(
      //   ((set) => (f) =>
      //     !set.has(f.title.toUpperCase()) && set.add(f.title.toUpperCase()))(
      //     new Set()
      //   )
      // );

      res.status(200).json(result);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/", async (req, res) => {
  const { title, tax_rate, tex, id } = req.body;
  const { _id, account } = req.authData;
  let { tax_type, tax_option, stores, dinings, categories, items } = req.body;

  try {
    const updatedRecord = await itemTax.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          title: title,
          tax_rate: tax_rate,
          account: account,
          tax_type: tax_type,
          tax_option: tax_option,
          stores: stores,
          dinings: dinings,
          categories: categories,
          items: items,
          createdBy: _id,
        },
      },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    );

    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    const { account } = req.authData;
    id = JSON.parse(id);
    for (const taxId of id) {
      await itemTax.deleteOne({ _id: taxId, account: account });
    }
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
