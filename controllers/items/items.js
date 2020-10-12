import express from "express";
import categoriesRouter from "./categories";
import discountRouter from "./discounts";
import modifierRouter from "./modifers";
import stockRouter from "./stock";
import ItemList from "../../modals/items/ItemList";
import uploadFiles from "../fileHandler/uploadFiles";
import { getOwner } from "../../function/getOwner";

const fs = require("fs-extra");

var router = express.Router();

router.post("/", async (req, res) => {
  var {
    name,
    availableForSale,
    soldByType,
    price,
    cost,
    sku,
    barcode,
    repoOnPos,
    trackStock,
    stockQty,
  } = req.body;
  var {
    category,
    varients,
    stores,
    modifiers,
    taxes,
    itemColor,
    itemShape,
  } = req.body;
  var image = req.files ? req.files.image : [];
if(cost == "" || typeof cost === "undefined" || cost == null){
  cost = 0;
}
  const { _id } = req.authData;
  varients = JSON.parse(varients);
  stores = JSON.parse(stores);
  modifiers = JSON.parse(modifiers);
  taxes = JSON.parse(taxes);
  category = JSON.parse(category);
  // stock = JSON.parse(stock);
  // res.status(200).send(data);

  var itemImageName = "";
  let owner = await getOwner(_id);
console.log(owner)
  if (repoOnPos == "image") {
    if (
      req.files != null &&
      req.files != "null" &&
      typeof req.files != "undefined"
    ) {
      if (typeof req.files.image != "undefined") {
        var uploadResult = await uploadFiles.uploadImages(
          image,
          `items/${owner._id}`
        );
        if (!uploadResult.success) {
          res.status(404).json({ message: uploadResult.message });
        }
        itemImageName = uploadResult.images[0];
        itemColor = "";
        itemShape = "";
      }
    }
  }
  const newItemList = new ItemList({
    name,
    category,
    availableForSale,
    soldByType,
    price,
    cost,
    sku,
    barcode,
    trackStock,
    stockQty,
    varients,
    stores,
    modifiers,
    taxes,
    repoOnPos,
    image: itemImageName,
    color: itemColor,
    shape: itemShape,
    createdBy: _id,
  });
  try {
    const result = await newItemList.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch("/", async (req, res) => {
  var {
    item_id,
    name,
    imageName,
    availableForSale,
    soldByType,
    price,
    cost,
    sku,
    barcode,
    repoOnPos,
    trackStock,
    stockQty,
  } = req.body;
  var {
    category,
    varients,
    stores,
    modifiers,
    taxes,
    itemColor,
    itemShape,
  } = req.body;
  var image = req.files ? req.files.image : [];
  if(cost == "" || typeof cost === "undefined" || cost == null){
    cost = 0;
  }
  const { _id } = req.authData;
  varients = JSON.parse(varients);
  stores = JSON.parse(stores);
  modifiers = JSON.parse(modifiers);
  taxes = JSON.parse(taxes);
  category = JSON.parse(category);
  // stock = JSON.parse(stock);
  // res.status(200).send(data);

  var itemImageName = "";
  let owner = await getOwner(_id);

  var rootDir = process.cwd();

  if (repoOnPos == "image") {
    if (
      req.files != null &&
      req.files != "null" &&
      typeof req.files != "undefined"
    ) {
      if (typeof req.files.image != "undefined") {
        fs.unlinkSync(`${rootDir}/uploads/items/${owner._id}/` + imageName);
        var uploadResult = await uploadFiles.uploadImages(
          image,
          `items/${owner._id}`
        );
        if (!uploadResult.success) {
          res.status(404).json({ message: uploadResult.message });
          conn.release();
        }
        itemImageName = uploadResult.images[0];
        itemColor = "";
        itemShape = "";
      }
    }
  }
  let data = {
    name,
    category,
    availableForSale,
    soldByType,
    price,
    cost,
    sku,
    barcode,
    trackStock,
    stockQty,
    varients,
    stores,
    modifiers,
    taxes,
    repoOnPos,
    image: itemImageName,
    color: itemColor,
    shape: itemShape,
    createdBy: _id,
  };
  try {
    await ItemList.updateOne({ _id: item_id }, data);
    let result = await ItemList.findOne({ _id: item_id });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { page, limit, storeId } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    var result = await ItemList.find({
      stores: { $elemMatch: { id: storeId } },
    }).sort({ _id: "desc" });
    // .select('name -_id  category.categoryId');
    // result.exec(function (err, someValue) {
    //         if (err) return next(err);
    //         res.send(someValue);
    //     });
    result = result.slice(startIndex, endIndex);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/searchByName", async (req, res) => {
  try {
    let { name, storeId } = req.body;

    let filters = {
      stores: { $elemMatch: { id: storeId } },
      name: { $regex: ".*" + name + ".*", $options: "i" },
    };

    var result = await ItemList.find(filters).sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/search", async (req, res) => {
  try {
    const { _id } = req.authData;
    let { search, stockFilter, categoryFilter, storeId } = req.query;
    search = req.query.search.trim();
    let storeFilter = {};
    if (storeId !== "0") {
      storeFilter.stores = { $elemMatch: { id: storeId } };
    }
    if (categoryFilter !== "0" && categoryFilter !== undefined) {
      storeFilter["category.id"] = categoryFilter;
    }
    if (stockFilter !== "0" && stockFilter !== undefined) {
      storeFilter.stockId = stockFilter;
    }
    if (search !== "" && search !== undefined) {
      storeFilter.name = { $regex: ".*" + search + ".*", $options: "i" };
    }
    storeFilter.createdBy = _id;

    var result = await ItemList.find(storeFilter).sort({ _id: "desc" });
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
      await ItemList.deleteOne({ _id: id });
    });

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.use("/categories", categoriesRouter);
router.use("/discount", discountRouter);
router.use("/modifier", modifierRouter);
router.use("/items", ItemList);
router.use("/stock", stockRouter);
module.exports = router;
// if (storeId === "0") {
//   storeFilter = {
//     $elemMatch: { id: { $regex: ".*" + storeId + ".*", $options: "i" } },
//   };
// } else {
//   storeFilter = { $elemMatch: { id: storeId } };
// }
// // storeId !== '0' ?
// //   stores: { $elemMatch: { id: storeId } } : '',
// let filters;
// if (stockFilter == undefined && categoryFilter == undefined) {
//   filters = {
//     // stores: { $elemMatch: { id: storeId } },
//     stores: storeFilter,
//     name: { $regex: ".*", $options: "i" },
//     // categoryId: categoryFilter,
//     // stockId: stockFilter,
//     createdBy: _id,
//   };
// } else if (stockFilter == undefined) {
//   filters = {
//     // stores: { $elemMatch: { id: storeId } },
//     stores: storeFilter,
//     name: { $regex: ".*" + search + ".*", $options: "i" },
//     "category.id": categoryFilter,
//     // category: { categoryId: categoryFilter },
//     createdBy: _id,
//   };
// } else if (categoryFilter == undefined) {
//   filters = {
//     // stores: { $elemMatch: { id: storeId } },
//     stores: storeFilter,
//     name: { $regex: ".*" + search + ".*", $options: "i" },
//     stockId: stockFilter,
//     createdBy: _id,
//   };
// } else {
//   filters = {
//     // stores: { $elemMatch: { id: storeId } },
//     stores: storeFilter,
//     name: { $regex: ".*" + search + ".*", $options: "i" },
//     // categoryId: categoryFilter,
//     "category.categoryId": categoryFilter,
//     // category: { categoryId: categoryFilter },
//     stockId: stockFilter,
//     createdBy: _id,
//   };
// }
// console.log(filters);
// var result = await ItemList.find(filters).sort({ _id: "desc" });
