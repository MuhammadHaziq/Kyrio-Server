import express from "express";
import categoriesRouter from "./categories";
import discountRouter from "./discounts";
import modifierRouter from "./modifers";
import stockRouter from "./stock";
import ItemList from "../../modals/items/ItemList";
import uploadFiles from "../fileHandler/uploadFiles";
import { getOwner } from "../../function/getOwner";
import Modifier from "../../modals/items/Modifier";
import Category from "../../modals/items/category";
import itemTax from "../../modals/settings/taxes/itemTax";
import Store from "../../modals/Store";
const csv = require("fast-csv");
const fs = require("fs-extra");

var router = express.Router();
/* Server Side Record*/
router.get("/serverSide", async (req, res) => {
  try {
    const { accountId } = req.authData;
    // const { page, limit, storeId } = req.query;
    let {
      page,
      limit,
      search,
      stockFilter,
      categoryFilter,
      storeId,
    } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // search = req.query.search.trim();
    let storeFilter = {};
    if (storeId !== "0") {
      storeFilter.stores = { $elemMatch: { id: storeId } };
    }
    if (categoryFilter !== "-1" && categoryFilter !== undefined) {
      storeFilter["category.id"] = categoryFilter;
    }
    if (stockFilter !== "-1" && stockFilter !== undefined) {
      storeFilter.stockId = stockFilter;
    }
    if (search !== "" && search !== undefined) {
      storeFilter = {
        $or: [
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
          {
            "category.name": {
              $regex: ".*" + search + ".*",
              $options: "i",
            },
          },
        ],
      };
    }
    storeFilter.accountId = accountId;
    let serverSideData = [];

    var result = await ItemList.find({
      stores: { $elemMatch: { id: storeId } },
    })
      .skip(startIndex * endIndex)
      .limit(endIndex)
      .exec(function (err, doc) {
        if (err) {
          res.status(500).json({ message: error.message });
          return;
        }
        ItemList.countDocuments().exec((err, count) => {
          doc.forEach((item) => {
            let price = Number(item.price).toLocaleString("en-IN");
            price = Number(price).toFixed(2);
            let cost = Number(item.cost).toLocaleString("en-IN");
            cost = Number(cost).toFixed(2);
            let margin = "0";
            if (+item.cost === +item.price) {
              margin = "0";
            } else {
              margin =
                +item.price === 0
                  ? +item.cost * 100
                  : (+item.cost / +item.price) * 100;
            }
            margin = Number(margin).toFixed(2) + " %";
            const array = [
              item.name,
              item["category"].name,
              price,
              cost,
              margin,
              item.stockQty,
            ];
            serverSideData.push(array);
          });

          const serverResponse = {
            draw: Number(req.query.draw), // for every request/draw by clientside , they send a number as a parameter, when they recieve a response/data they first check the draw number, so we are sending same number in draw.
            recordsTotal: Number(count),
            recordsFiltered: Number(count),
            // searching, if there is no searching then totalFiltered = totalData
            deferLoading: Number(count),
            data: serverSideData,
          };

          res.status(200).json(serverResponse);
          // res.status(200).json({
          //   doc: doc,
          //   count: count,
          //   pages: Math.floor(count / limit) + 1,
          // });
        });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/*
router.get("/:id", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const { id } = req.params;

    var result = await ItemList.find({
      accountId: accountId,
      _id: id,
    }).sort({ _id: "desc" });
    if(result.length > 0) {

      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/

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
  if (cost == "" || typeof cost === "undefined" || cost == null) {
    cost = 0;
  }
  const { _id, accountId } = req.authData;
  if (varients !== undefined && varients !== null) {
    varients = JSON.parse(varients);
  }
  if (stores !== undefined && stores !== null) {
    stores = JSON.parse(stores);
  }
  if (modifiers !== undefined && modifiers !== null) {
    modifiers = JSON.parse(modifiers);
  }
  if (taxes !== undefined && taxes !== null) {
    taxes = JSON.parse(taxes);
  }
  if (category !== undefined && category !== null) {
    category = JSON.parse(category);
  } else {
    category = null;
  }

  // stock = JSON.parse(stock);
  // res.status(200).send(data);

  var itemImageName = "";
  // let owner = await getOwner(_id);

  /*typeof req.files.image != "undefined" Update By Haziq
      For Add Image If User Select Color After Upload Image
  */
  if (
    repoOnPos == "image" ||
    (typeof req.files != "undefined" && typeof req.files != "null")
  ) {
    if (
      req.files != null &&
      req.files != "null" &&
      typeof req.files != "undefined"
    ) {
      if (typeof req.files.image != "undefined") {
        var uploadResult = await uploadFiles.uploadImages(
          image,
          `items/${accountId}`
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
    accountId,
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
    created_by: _id,
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
    dsd,
    modifiersStatus,
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
  if (cost == "" || typeof cost === "undefined" || cost == null) {
    cost = 0;
  }
  const { _id, accountId } = req.authData;
  if (varients !== undefined && varients !== null) {
    varients = JSON.parse(varients);
  }
  if (stores !== undefined && stores !== null) {
    stores = JSON.parse(stores);
  }
  if (modifiers !== undefined && modifiers !== null) {
    modifiers = JSON.parse(modifiers);
  }
  if (taxes !== undefined && taxes !== null) {
    taxes = JSON.parse(taxes);
  }
  if (category !== undefined && category !== null) {
    category = JSON.parse(category);
  } else {
    category = null;
  }
  if (dsd !== undefined) {
    dsd = dsd;
  } else {
    dsd = false;
  }
  if (modifiersStatus !== undefined) {
    modifiersStatus = modifiersStatus;
  } else {
    modifiersStatus = false;
  }
  // varients = JSON.parse(varients);
  // stores = JSON.parse(stores);
  // modifiers = JSON.parse(modifiers);
  // taxes = JSON.parse(taxes);
  // category = JSON.parse(category);
  // stock = JSON.parse(stock);
  // res.status(200).send(data);

  // var itemImageName = "";
  // Add By Haaziq
  var itemImageName = imageName;

  // let owner = await getOwner(_id);

  var rootDir = process.cwd();
  /*typeof req.files.image != "undefined" Update By Haziq
      For Add Image If User Select Color After Upload Image
  */
  if (
    repoOnPos == "image" ||
    (typeof req.files != "undefined" && typeof req.files != "null")
  ) {
    if (
      req.files != null &&
      req.files != "null" &&
      typeof req.files != "undefined"
    ) {
      if (typeof req.files.image != "undefined") {
        // Comment By Haziq Add Image Name Validation For Null
        if (typeof imageName !== "undefined" && typeof imageName !== "null") {
          let fileUrl = `${rootDir}/uploads/items/${accountId}/` + imageName;
          if (fs.existsSync(fileUrl)) {
            fs.unlinkSync(fileUrl);
          }
        }
        var uploadResult = await uploadFiles.uploadImages(
          image,
          `items/${accountId}`
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
    modifiersStatus,
    dsd,
    stockQty,
    varients,
    stores,
    modifiers,
    taxes,
    repoOnPos,
    image: itemImageName,
    color: itemColor,
    shape: itemShape,
    created_by: _id,
  };
  try {
    let result = await ItemList.findOneAndUpdate({ _id: item_id }, data);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const { page, limit, storeId } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    var result = await ItemList.find({
      // stores: { $elemMatch: { id: storeId } },
      accountId: accountId,
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

router.get("/storeItems", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const { storeId } = req.query;

    var items = await ItemList.find({
      stores: { $elemMatch: { id: storeId } },
      accountId: accountId,
    })
      .select([
        "_id",
        "category",
        "availableForSale",
        "soldByType",
        "price",
        "cost",
        "sku",
        "barcode",
        "trackStock",
        "compositeItem",
        "stockQty",
        "varients",
        "stores.price",
        "stores.id",
        "stores.inStock",
        "stores.lowStock",
        "modifiers",
        "taxes",
        "repoOnPos",
        "image",
        "color",
        "shape",
        "created_at",
        "created_by",
      ])
      .sort({ _id: "desc" });
    let itemsObjectFilter = items;
    // for (const item of items) {
    //   itemsObjectFilter.push({
    //     _id: item._id,
    //     category: item.category,
    //     availableForSale: item.availableForSale,
    //     soldByType: item.soldByType,
    //     price: item.price,
    //     cost: item.cost,
    //     sku: item.sku,
    //     barcode: item.barcode,
    //     trackStock: item.trackStock,
    //     compositeItem: item.compositeItem,
    //     stockQty: item.stockQty,
    //     varients: item.varients,
    //     storeID: item.stores[0].id,
    //     storePrice: item.stores[0].price,
    //     inStock: item.stores[0].inStock,
    //     lowStock: item.stores[0].lowStock,
    //     modifiers: item.modifiers,
    //     taxes: item.taxes,
    //     repoOnPos: item.repoOnPos,
    //     image: item.image,
    //     color: item.color,
    //     shape: item.shape,
    //     created_at: item.created_at,
    //     created_by: item.created_by,
    //   });
    // }

    res.status(200).json(itemsObjectFilter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/searchByName", async (req, res) => {
  try {
    let { name, storeId } = req.body;
    const { accountId } = req.authData;

    let filters = {
      accountId: accountId,
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
    const { accountId } = req.authData;
    let { search, stockFilter, categoryFilter, storeId } = req.query;
    search = req.query.search.trim();
    let storeFilter = {};
    if (storeId !== "0") {
      storeFilter.stores = { $elemMatch: { id: storeId } };
    }
    if (
      categoryFilter !== "-1" &&
      categoryFilter !== "0" &&
      categoryFilter !== undefined
    ) {
      storeFilter["category.id"] = categoryFilter;
    }
    if (
      stockFilter !== "-1" &&
      stockFilter !== "0" &&
      stockFilter !== undefined
    ) {
      storeFilter.stockId = stockFilter;
    }
    if (search !== "" && search !== undefined) {
      storeFilter = {
        $or: [
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
          {
            "category.name": {
              $regex: ".*" + search + ".*",
              $options: "i",
            },
          },
        ],
      };
      // storeFilter.name = { $regex: ".*" + search + ".*", $options: "i" };
      // storeFilter["category.name"] = {
      //   $regex: ".*" + search + ".*",
      //   $options: "i",
      // };
    }
    storeFilter.accountId = accountId;
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

router.get("/get_item_stores", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const stores = await Store.find({ accountId: accountId }).sort({
      _id: "desc",
    });
    let allStores = [];
    for (const store of stores) {
      allStores.push({
        id: store._id,
        title: store.title,
        price: "",
        inStock: 0,
        lowStock: "",
        variantName: "",
        modifiers: await Modifier.find({
          stores: { $elemMatch: { id: store._id } },
        })
          .select("title")
          .sort({
            _id: "desc",
          }),
        taxes: await itemTax
          .find({
            stores: { $elemMatch: { storeId: store._id } },
            accountId: accountId,
          })
          .select("title tax_type tax_rate")
          .sort({ _id: "desc" }),
      });
    }
    res.status(200).json({ stores: allStores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/row/:id", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const { id } = req.params;

    var result = await ItemList.findOne({
      _id: id,
      accountId: accountId,
    }).sort({ _id: "desc" });

    // result = result.slice(startIndex, endIndex);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const checkDuplicate = (array) => {
  var errors = [];
  // let arr = ["abc", "xy", "bb", "abc"];
  let result = false;
  // call some function with callback function as argument
  result = array.some((element, index) => {
    return array.indexOf(element) !== index;
  });
  if (result) {
    array.some((element, index) => {
      if (array.indexOf(element) !== index) {
        console.log({ index: index, sku: element });
        errors.push({
          index: index,
          name: element,
          totalLength: element.length,
        });
      }
    });
    return errors;
    console.log("Array contains duplicate elements");
  } else {
    console.log("Array does not contain duplicate elements");
  }
};

router.post("/save_csv", async (req, res) => {
  try {
    var errors = [];
    const { accountId, _id } = req.authData;
    let { csvData } = req.body;
    csvData = JSON.parse(csvData);
    const stores = await Store.find().sort({
      _id: "desc",
    });
    const modifier = await Modifier.find().sort({
      _id: "desc",
    });

    const skuErrors = checkDuplicate(
      (csvData || []).map((item, index) => {
        return item.SKU;
      })
    );
    const handleErrors = checkDuplicate(
      (csvData || []).map((item, index) => {
        return item.Handle;
      })
    );
    const NameLength = (csvData || [])
      .map((item, index) => {
        return item.Name !== undefined && item.Name !== null
          ? item.Name.length > 63
            ? { index: index, value: item.Name.length }
            : { index: index, value: null }
          : { index: index, value: null };
      })
      .filter((item) => {
        return item.value !== null;
      });
    const handleLength = (csvData || [])
      .map((item, index) => {
        return item.Handle !== undefined && item.Handle !== null
          ? item.Handle.length > 71
            ? { index: index, value: item.Handle.length }
            : { index: index, value: null }
          : { index: index, value: null };
      })
      .filter((item) => {
        return item.value !== null;
      });
    errors.push({
      skuErrors: skuErrors,
      handleErrors: handleErrors,
      NameLength: NameLength,
      handleLength: handleLength,
    });
    if (
      skuErrors.length > 0 ||
      handleErrors.length > 0 ||
      NameLength.length > 0
    ) {
      res.status(400).json(errors);
    }
    // console.log(skuErrors);
    // console.log(handleErrors);
    // console.log(NameLength);
    return false;
    let data = [];
    await (csvData || []).map(async (item, index) => {
      let storeData = [];
      let modifierData = [];
      let varientName = [];
      let varientValue1 = [];
      let varientValue2 = [];
      let varientValue3 = [];
      var keys = Object.keys(item);
      (keys || []).map((ite, iteIndex) => {
        let getStore = ite.match(/([^[\]]+|\[\])/g).map(function (val) {
          return val === "[]" ? null : val;
        })[1];
        (stores || []).map(async (stor, storIndex) => {
          if (getStore !== undefined && getStore !== null) {
            // if (ite == `Available for sale [${stor.title}]`) {
            if (getStore.trim() == stor.title.trim()) {
              return storeData.push({
                id: stor._id,
                title: stor.title,
                price: item[`Price [${stor.title}]`],
                inStock: item[`In stock [${stor.title}]`],
                lowStock: item[`Low stock [${stor.title}]`],
                variantName: "",
                modifiers: Modifier.find({
                  stores: { $elemMatch: { id: stor._id } },
                })
                  .select("title")
                  .sort({
                    _id: "desc",
                  }),
                taxes: itemTax
                  .find({
                    stores: { $elemMatch: { storeId: stor._id } },
                    accountId: accountId,
                  })
                  .select("title tax_type tax_rate")
                  .sort({ _id: "desc" }),
              });
            } else {
              const newStore = new Store({
                title: getStore,
                address: "",
                phone: "",
                description: "",
                createdBy: _id,
                accountId: accountId,
              });
              try {
                const result = await newStore.save();
                return storeData.push({
                  id: result._id,
                  title: result.title,
                  price: item[`Price [${getStore}]`],
                  inStock: item[`In stock [${getStore}]`],
                  lowStock: item[`Low stock [${getStore}]`],
                  variantName: "",
                  modifiers: Modifier.find({
                    stores: { $elemMatch: { id: result._id } },
                  })
                    .select("title")
                    .sort({
                      _id: "desc",
                    }),
                  taxes: itemTax
                    .find({
                      stores: { $elemMatch: { storeId: result._id } },
                      accountId: accountId,
                    })
                    .select("title tax_type tax_rate")
                    .sort({ _id: "desc" }),
                });
              } catch (error) {
                if (error.code === 11000) {
                  // console.log({ message: "Store Already Register" });
                  // res.status(400).json({ message: "Store Already Register By This User" });
                } else {
                  // console.log({ message: error.message });
                  // res.status(400).json({ message: error.message });
                }
              }
            }
          }
        });
        (modifier || []).map((modi, modiIndex) => {
          if (
            `Modifier - "${modi.title}"` == ite ||
            `Modifier-${modi.title}` == ite
          ) {
            modifierData.push({
              id: modi._id,
              title: modi.title,
            });
          }
        });
      });

      const getSameHandle = (csvData || []).filter(
        (filterVar, varIndex) => filterVar.Handle == item.Handle
      );
      if (item.Name !== "" && item.Name !== undefined && item.Name !== null) {
        if (
          getSameHandle[0]["Option 1 name"] !== "" &&
          getSameHandle[0]["Option 1 name"] !== undefined &&
          getSameHandle[0]["Option 1 name"] !== null
        ) {
          getSameHandle.map((itemVar, varIndex) => {
            if (
              itemVar["Option 1 value"] !== "" &&
              itemVar["Option 1 value"] !== undefined &&
              itemVar["Option 1 value"] !== null
            ) {
              varientValue1.push({
                price: itemVar["Default price"],
                cost: itemVar.Cost,
                sku: itemVar.SKU,
                barcode: itemVar.Barcode,
                variantName: itemVar["Option 1 value"],
              });
            }
          });
          if (varientValue1.length > 0) {
            varientName.push({
              optionName: getSameHandle[0]["Option 1 name"],
              optionValue: varientValue1,
            });
          }
        }
        if (
          getSameHandle[0]["Option 2 name"] !== "" &&
          getSameHandle[0]["Option 2 name"] !== undefined &&
          getSameHandle[0]["Option 2 name"] !== null
        ) {
          getSameHandle.map((itemVar, varIndex) => {
            if (
              itemVar["Option 2 value"] !== "" &&
              itemVar["Option 2 value"] !== undefined &&
              itemVar["Option 2 value"] !== null
            ) {
              varientValue2.push({
                price: itemVar["Default price"],
                cost: itemVar.Cost,
                sku: itemVar.SKU,
                barcode: itemVar.Barcode,
                variantName: itemVar["Option 2 value"],
              });
            }
          });
          if (varientValue2.length > 0) {
            varientName.push({
              optionName: getSameHandle[0]["Option 2 name"],
              optionValue: varientValue2,
            });
          }
        }
        if (
          getSameHandle[0]["Option 3 name"] !== "" &&
          getSameHandle[0]["Option 3 name"] !== undefined &&
          getSameHandle[0]["Option 3 name"] !== null
        ) {
          getSameHandle.map((itemVar, varIndex) => {
            if (
              itemVar["Option 3 value"] !== "" &&
              itemVar["Option 3 value"] !== undefined &&
              itemVar["Option 3 value"] !== null
            ) {
              varientValue3.push({
                price: itemVar["Default price"],
                cost: itemVar.Cost,
                sku: itemVar.SKU,
                barcode: itemVar.Barcode,
                variantName: itemVar["Option 3 value"],
              });
            }
          });
          if (varientValue3.length > 0) {
            varientName.push({
              optionName: getSameHandle[0]["Option 3 name"],
              optionValue: varientValue3,
            });
          }
        }
      }
      let category = {};
      try {
        await Category.find({ catTitle: item.Category })
          .then((catData) => {
            if (catData !== null && catData.length !== 0) {
              category = {
                id: catData[0]._id,
                name: catData[0].catTitle,
              };
            }
          })
          .catch((err) => {
            console.log(err.message);
          });
      } catch (err) {
        console.log(err.message);
      }

      // data.push({
      //   name: item.Name,
      //   accountId: accountId,
      //   category: category,
      //   soldByType: item["Sold by weight"] == "N" ? "Each" : "Sold by weight",
      //   price: item["Default price"],
      //   cost: item.Cost,
      //   sku: item.SKU,
      //   barcode: item.Barcode,
      //   trackStock: item["Track stock"] == "N" ? false : true,
      //   varients: varientName,
      //   stores: storeData,
      //   modifiers: modifierData,
      //   created_by: _id,
      // });
      if (item.Name !== "" && item.Name !== undefined && item.Name !== null) {
        const Exist = await ItemList.find({
          name: item.Name,
          sku: item.SKU,
        }).sort({ _id: "desc" });
        const newItemList = new ItemList({
          name: item.Name,
          accountId: accountId,
          category: category,
          soldByType: item["Sold by weight"] == "N" ? "Each" : "Sold by weight",
          price: item["Default price"],
          cost: item.Cost,
          sku: item.SKU,
          barcode: item.Barcode,
          trackStock: item["Track stock"] == "N" ? false : true,
          varients: varientName.length === 0 ? null : varientName,
          stores: storeData,
          modifiers: modifierData,
          taxes: [],
          repoOnPos: "Color_and_shape",
          image: "",
          color: "",
          shape: "",
          availableForSale: false,
          created_by: _id,
        });
        // console.log("New Item List", newItemList);
        if (Exist.length > 0 && Exist !== null) {
          try {
            await ItemList.updateOne(
              {
                name: item.Name,
                sku: item.SKU,
              },
              newItemList
            );
            // res.status(201).json(result);
          } catch (error) {
            console.log("Durning Update", error.message);
            // res.status(400).json({ message: error.message });
          }
        } else {
          try {
            // console.log("newItemList", newItemList);
            const result = await newItemList.save();
          } catch (error) {
            console.log("Durning Insert", error.message);
            // res.status(400).json({ message: error.message });
          }
        }
      }
    });
    res.status(200).send({ message: "Record Save Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// router.post("/import-csv", async (req, res) => {
//   try {
//     console.log(req.body);
//     const file = req.body.demo_file;
//     console.log("file", 'uploads/items/export_items.csv');
//     fs.createReadStream('uploads/items/export_items.csv')
//       .pipe(csv.parse({ headers: true }))
//       // pipe the parsed input into a csv formatter
//       .pipe(csv.format({ headers: true }))
//       // Using the transform function from the formatting stream
//       .transform((row, next) => {
//         console.log(row);
//         // User.findById(row.id, (err, user) => {
//         //   if (err) {
//         //     return next(err);
//         //   }
//         //   return next(null, {
//         //     id: row.id,
//         //     firstName: row.first_name,
//         //     lastName: row.last_name,
//         //     address: row.address,
//         //     // properties from user
//         //     isVerified: user.isVerified,
//         //     hasLoggedIn: user.hasLoggedIn,
//         //     age: user.age,
//         //   });
//         // });
//       })
//       .pipe(process.stdout)
//       .on("end", () => process.exit());
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

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
//     created_by: _id,
//   };
// } else if (stockFilter == undefined) {
//   filters = {
//     // stores: { $elemMatch: { id: storeId } },
//     stores: storeFilter,
//     name: { $regex: ".*" + search + ".*", $options: "i" },
//     "category.id": categoryFilter,
//     // category: { categoryId: categoryFilter },
//     created_by: _id,
//   };
// } else if (categoryFilter == undefined) {
//   filters = {
//     // stores: { $elemMatch: { id: storeId } },
//     stores: storeFilter,
//     name: { $regex: ".*" + search + ".*", $options: "i" },
//     stockId: stockFilter,
//     created_by: _id,
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
//     created_by: _id,
//   };
// }
// console.log(filters);
// var result = await ItemList.find(filters).sort({ _id: "desc" });
