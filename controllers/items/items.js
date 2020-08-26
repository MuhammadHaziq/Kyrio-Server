import express from "express";
import categoriesRouter from "./categories";
import discountRouter from "./discounts";
import modifierRouter from "./modifers";
import stockRouter from "./stock";
import ItemList from "../../modals/items/ItemList";
import uploadFiles from "../fileHandler/uploadFiles";
var router = express.Router();

router.post("/", async (req, res) => {
  const {
    name,
    availableForSale,
    soldByType,
    price,
    cost,
    sku,
    barcode,
    repoOnPos,
    stockId,
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
  const { _id } = req.authData;
  varients = JSON.parse(varients);
  stores = JSON.parse(stores);
  modifiers = JSON.parse(modifiers);
  taxes = JSON.parse(taxes);
  category = JSON.parse(category);
  // stock = JSON.parse(stock);
  // res.status(200).send(data);

  var itemImageName = "";

  if (repoOnPos == "image") {
    if (
      req.files != null &&
      req.files != "null" &&
      typeof req.files != "undefined"
    ) {
      if (typeof req.files.itemImage != "undefined") {
        var files = req.files.itemImage;
        var uploadResult = await uploadFiles.uploadImages(files, "items");
        if (!uploadResult.success) {
          res.status(200).json({ message: "error" });
          conn.release();
        }
        console.log(uploadResult);
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
    stockId,
    stockQty,
    varients,
    stores,
    modifiers,
    taxes,
    repoOnPos,
    itemImageName,
    itemColor,
    itemShape,
    createdBy: _id,
  });
  try {
    const result = await newItemList.save();
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
      stores: { $elemMatch: { storeId: storeId } },
      createdBy: _id,
    });

    result = result.slice(startIndex, endIndex);
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
    let filters;
    if (stockFilter == undefined && categoryFilter == undefined) {
      filters = {
        stores: { $elemMatch: { storeId: storeId } },
        name: { $regex: ".*" + search + ".*", $options: "i" },
        // categoryId: categoryFilter,
        // stockId: stockFilter,
        createdBy: _id,
      };
    } else if (stockFilter == undefined) {
      filters = {
        stores: { $elemMatch: { storeId: storeId } },
        name: { $regex: ".*" + search + ".*", $options: "i" },
        category: { categoryId: categoryFilter },
        createdBy: _id,
      };
    } else if (categoryFilter == undefined) {
      filters = {
        stores: { $elemMatch: { storeId: storeId } },
        name: { $regex: ".*" + search + ".*", $options: "i" },
        stockId: stockFilter,
        createdBy: _id,
      };
    } else {
      filters = {
        stores: { $elemMatch: { storeId: storeId } },
        name: { $regex: ".*" + search + ".*", $options: "i" },
        // categoryId: categoryFilter,
        category: { categoryId: categoryFilter },
        stockId: stockFilter,
        createdBy: _id,
      };
    }
    var result = await ItemList.find(filters);
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
