import express from "express";
import itemTax from "../../../modals/settings/taxes/itemTax";
// import diningOption from "../../../modals/settings/diningOption";
import diningOption2 from "../../../modals/settings/diningOption2";
import Category from "../../../modals/items/category";
import ItemList from "../../../modals/items/ItemList";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, tax_rate, tex } = req.body;
  const { _id } = req.authData;
  let { tax_type, tax_option, stores, dinings, categories, items } = req.body;
  stores = JSON.parse(stores);
  dinings = JSON.parse(dinings);
  categories = JSON.parse(categories);
  items = JSON.parse(items);
  tax_option = JSON.parse(tax_option);
  tax_type = JSON.parse(tax_type);

  const newItemTax = new itemTax({
    title: title,
    tax_rate: tax_rate,
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
    const { _id } = req.authData;
    const result = await itemTax.find({ createdBy: _id }).sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/getStoreTaxes", async (req, res) => {
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
    const result = await itemTax.find(filter).sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const { _id } = req.authData;
    const allCat = await Category.find({ createdBy: _id }).sort({
      _id: "desc",
    });
    let allCategories = [];
    for (const cate of allCat) {
      let itemCount = await ItemList.find({
        "category.id": cate._id,
      }).countDocuments();
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
    const { _id } = req.authData;
    let { storeId } = req.body;
    storeId = JSON.parse(storeId);
    let filter = {};
    if (storeId == 0) {
      filter = {
        createdBy: _id,
      };
    } else {
      filter = {
        storeId: { $in: storeId },
        createdBy: _id,
      };
    }
    // const result = await POS_Device.findOne({ "store.storeId": storeId, createdBy: _id , isActive: false});
    const result = await diningOption2.find(filter);
    if (result !== null && result !== undefined) {
      // Get Only Unique names
      // var unique = [...new Set(result.map((item) => item.title.toUpperCase()))];

      //  Get Unique Objects
      let titles = [];
      result.map((item) => {
        item.diningOptions.map((ite) => {
          return titles.push({ title: ite.title });
        });
      });
      var unique = titles.filter(
        ((set) => (f) =>
          !set.has(f.title.toUpperCase()) && set.add(f.title.toUpperCase()))(
          new Set()
        )
      );

      res.status(200).json(unique);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.post("/getTaxDining", async (req, res) => {
//   try {
//     const { _id } = req.authData;
//     let { storeId } = req.body;
//     storeId = JSON.parse(storeId);
//     let filter = {};
//     if (storeId == 0) {
//       filter = {
//         createdBy: _id,
//       };
//     } else {
//       filter = {
//         stores: { $elemMatch: { storeId: { $in: storeId } } },
//         createdBy: _id,
//       };
//     }
//     // const result = await POS_Device.findOne({ "store.storeId": storeId, createdBy: _id , isActive: false});
//     const result = await diningOption.find(filter);
//     if (result !== null && result !== undefined) {
//       // Get Only Unique names
//       // var unique = [...new Set(result.map((item) => item.title.toUpperCase()))];
//
//       //  Get Unique Objects
//       var unique = result.filter(
//         ((set) => (f) =>
//           !set.has(f.title.toUpperCase()) && set.add(f.title.toUpperCase()))(
//           new Set()
//         )
//       );
//
//       res.status(200).json(unique);
//     } else {
//       res.status(200).json([]);
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.patch("/", async (req, res) => {
  const { title, tax_rate, tex, id } = req.body;
  const { _id } = req.authData;
  let { tax_type, tax_option, stores, dinings, categories, items } = req.body;
  stores = JSON.parse(stores);
  dinings = JSON.parse(dinings);
  categories = JSON.parse(categories);
  items = JSON.parse(items);
  tax_option = JSON.parse(tax_option);
  tax_type = JSON.parse(tax_type);

  try {
    const updatedRecord = await itemTax.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          title: title,
          tax_rate: tax_rate,
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
    const { _id } = req.authData;
    id = JSON.parse(id);
    for (const taxId of id) {
      await itemTax.deleteOne({ _id: taxId, createdBy: _id });
    }
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
