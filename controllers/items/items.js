import express from "express";
import categoriesRouter from "./categories";
import discountRouter from "./discounts";
import modifierRouter from "./modifers";
import stockRouter from "./stock";
import ItemList from "../../modals/items/ItemList";
import uploadFiles from "../fileHandler/uploadFiles";
import { ITEM_INSERT, ITEM_UPDATE, ITEM_DELETE } from "../../sockets/events";
import Modifier from "../../modals/items/Modifier";
import SkuHistory from "../../modals/items/skuHistory";
import itemTax from "../../modals/settings/taxes/itemTax";
import Store from "../../modals/Store";
import { uploadCsv, deleteFile } from "../fileHandler/uploadFiles";
import { min } from 'lodash';
// const csv = require("fast-csv");
const fs = require("fs-extra");
const csv = require("@fast-csv/parse");
const ObjectId = require("mongoose").Types.ObjectId;

var router = express.Router();


const itemsForApp = async (req,ItemId) => {
  try {
    const { account } = req.authData;

    var items = await ItemList.find({
      _id: ItemId,
      account: account,
      deleted: 0,
    }).populate('stores.store', ["_id","title"]).populate('category', ["_id","title"]).populate({
      path: 'modifiers', 
      select: ["_id","title"],
      populate : [
        {
          path: 'stores',
          select: ["_id","title"]
        }]
    }).populate({ 
      path: 'taxes', 
      select: ["_id","title","tax_type","tax_rate"],
      populate : [{
          path: 'tax_type',
          select: ["_id","title"]
        },
        {
          path: 'stores',
          select: ["_id","title"]
        }]
      })
      .select([
        "_id",
        "title",
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
        "stores.store",
        "stores.inStock",
        "stores.lowStock",
        "modifiers",
        "taxes",
        "repoOnPos",
        "image",
        "color",
        "shape",
        "createdAt",
        "createdBy",
      ])
      .sort({ title: 1});
    let itemsObjectFilter = [];
    for (const item of items) {
      itemsObjectFilter.push({
        _id: item._id,
        title: item.title,
        category: item.category,
        availableForSale: item.availableForSale,
        soldByType: item.soldByType,
        price: item.price,
        cost: item.cost,
        sku: item.sku,
        barcode: item.barcode,
        trackStock: item.trackStock,
        compositeItem: item.compositeItem,
        stockQty: item.stockQty,
        varients: item.varients,
        storeId: item.stores[0].store._id,
        storeName: item.stores[0].store.title,
        storePrice: item.stores[0].price,
        inStock: item.stores[0].inStock,
        lowStock: item.stores[0].lowStock,
        modifiers: item.modifiers,
        taxes: item.taxes,
        repoOnPos: item.repoOnPos,
        image: item.image,
        color: item.color,
        shape: item.shape,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
      });
    }
    return itemsObjectFilter
    // res.status(200).json(itemsObjectFilter);
  } catch (error) {
    return { message: error.message }
    // res.status(500).json({ message: error.message });
  }
}
/* Server Side Record*/
router.get("/serverSide", async (req, res) => {
  try {
    const { account } = req.authData;
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
      storeFilter.stores = { $elemMatch: { store: storeId } };
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
          { title: { $regex: ".*" + search + ".*", $options: "i" } },
          {
            "category.name": {
              $regex: ".*" + search + ".*",
              $options: "i",
            },
          },
        ],
      };
    }
    storeFilter.account = account;
    let serverSideData = [];

    var result = await ItemList.find({
      stores: { $elemMatch: { store: storeId } },
    })
      .skip(startIndex * endIndex)
      .limit(endIndex).sort({title: 1})
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
              item.title,
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
        });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    var {
      title,
      compositeItem,
      availableForSale,
      soldByType,
      price,
      cost,
      sku,
      autoSKU,
      barcode,
      repoOnPos,
      trackStock,
      stockQty,
      category,
      varients,
      stores,
      modifiers,
      taxes,
      color,
      shape
    } = req.body;
   
    var image = req.files ? req.files.image : [];
    if (cost == "" || typeof cost === "undefined" || cost == null) {
      cost = 0;
    }
    const { _id, account, platform } = req.authData;
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
    if (typeof category == "undefined" || category == "" || category == "null" || category == null) {
      category = null
    }
    let checkSKU = await ItemList.findOne({
      account: account,
      sku: sku,
      deleted: 0,
    })
    if(!checkSKU){
      title = title !== null || title !== undefined ? title.trim() : "";

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
              `items/${account}`
            );
            if (!uploadResult.success) {
              res.status(404).json({ message: uploadResult.message });
            }
            itemImageName = uploadResult.images[0];
          }
        }
      }
      stores = stores.map(itm => {
        return {
          store: typeof itm.store._id == "undefined" ? itm.store : itm.store._id,
          price: itm.price,
          inStock: itm.inStock,
          lowStock: itm.lowStock
        }
      })
      
      const insert = await new ItemList({
        title,
        compositeItem,
        account,
        category,
        availableForSale,
        soldByType,
        price,
        cost,
        sku,
        autoSKU,
        barcode,
        trackStock,
        stockQty,
        varients,
        stores,
        modifiers,
        taxes,
        repoOnPos,
        image: itemImageName,
        color,
        shape,
        createdBy: _id
      }).save();

      if(autoSKU == "true" || autoSKU == true){
        await SkuHistory.findOneAndUpdate(
          { account: account },
          { $set: {
            sku: sku,
            updatedBy: _id,
          } },
          {
            new: true,
            upsert: true
          }
        );
      }
      

      var result = await ItemList.findOne({ _id: insert._id }).populate('stores.store', ["_id","title"]).populate('category', ["_id","title"]).populate({
        path: 'modifiers', 
        select: ["_id","title"],
        populate : [
          {
            path: 'stores',
            select: ["_id","title"]
          }]
      }).populate({ 
        path: 'taxes', 
        select: ["_id","title","tax_type","tax_rate"],
        populate : [{
            path: 'tax_type',
            select: ["_id","title"]
          },
          {
            path: 'stores',
            select: ["_id","title"]
          }]
        });
      const response = await itemsForApp(req,insert._id)
      req.io.to(account).emit(ITEM_INSERT, { app: response, backoffice: result, user: _id, account: account });
      if(platform === "pos"){
        res.status(200).json(response);
      } else if(platform === "backoffice"){
        res.status(200).json(result);
      }
   
    } else {
      res.status(400).json({ message: "Error creating item! Item with such SKU already exists." });
    }
  } catch (error) {
    if (error.code === 11000) {
      res
        .status(400)
        .json({ message: "Item with this name already exists" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.patch("/", async (req, res) => {
  try {
      var {
        item_id,
        title,
        compositeItem,
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
        category,
        varients,
        stores,
        modifiers,
        taxes,
        color,
        shape,
      } = req.body;
      var image = req.files ? req.files.image : [];
      if (cost == "" || typeof cost === "undefined" || cost == null) {
        cost = 0;
      }
      const { _id, account, platform } = req.authData;
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
      if (typeof category == "undefined" || category == "" || category == "null" || category == null) {
        category = null
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
      let checkSKU = await ItemList.find({
          account: account,
          sku: sku,
          deleted: 0,
          _id: {$ne : item_id}
        })
      if(checkSKU.length <= 0 ){
        var itemImageName = imageName;

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
                let fileUrl = `${rootDir}/uploads/items/${account}/` + imageName;
                if (fs.existsSync(fileUrl)) {
                  fs.unlinkSync(fileUrl);
                }
              }
              var uploadResult = await uploadFiles.uploadImages(
                image,
                `items/${account}`
              );
              if (!uploadResult.success) {
                res.status(404).json({ message: uploadResult.message });
              }
              itemImageName = uploadResult.images[0];
            }
          }
        }
        title = title !== null || title !== undefined ? title.trim() : "";
        stores = stores.map(itm => {
          return {
            store: typeof itm.store._id == "undefined" ? itm.store : itm.store._id,
            price: itm.price,
            inStock: itm.inStock,
            lowStock: itm.lowStock
          }
        })
        let data = {
          title,
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
          color,
          shape,
          createdBy: _id
        };
      
          let result = await ItemList.findOneAndUpdate(
            { _id: item_id },
            { $set: data },
            {
              new: true,
              upsert: true, // Make this update into an upsert
            }
          ).populate('stores.store', ["_id","title"]).populate('category', ["_id","title"]).populate({
            path: 'modifiers', 
            select: ["_id","title"],
            populate : [
              {
                path: 'stores',
                select: ["_id","title"]
              }]
          }).populate({ 
            path: 'taxes', 
            select: ["_id","title","tax_type","tax_rate"],
            populate : [{
                path: 'tax_type',
                select: ["_id","title"]
              },
              {
                path: 'stores',
                select: ["_id","title"]
              }]
            });
      
            const response = await itemsForApp(req,item_id)
            req.io.to(account).emit(ITEM_UPDATE, { app: response, backoffice: result, user: _id, account: account });
            if(platform === "pos"){
              res.status(200).json(response);
            } else if(platform === "backoffice"){
              res.status(200).json(result);
            }
      } else {
        res.status(400).json({ message: "Error editing item! Item with such SKU already exists." });
      }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/sku", async (req, res) => {
  try {
    const { account, _id } = req.authData;
    
    var skuFound = await SkuHistory.findOne({
      account: account
    })
    if(skuFound){
      let newSKU = "";
      // let sku = typeof skuFound.sku !== "undefined" || skuFound.sku !== null ? skuFound.sku : 
      for(var i = 1; i <= 99999; i++){
        newSKU = parseInt(skuFound.sku) + i
        var itemFound = await ItemList.findOne({
          sku: newSKU,
          account: account,
          deleted: 0,
        }).select("sku").sort({createdAt: -1})
        if(!itemFound){
          break;
        } 
      }
      res.status(200).json({sku: newSKU});
    } else { 
      const newSkuHistory = new SkuHistory({
        sku: parseInt(10000),
        account: account,
        createdBy: _id,
        updatedBy: _id,
      });
      const newSKU = await newSkuHistory.save();

      
      res.status(200).json({sku: newSKU.sku});
    }
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { account } = req.authData;
    const { page, limit, storeId } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    var result = await ItemList.find({
      account: account,
      deleted: 0,
    }).populate('stores.store', ["_id","title"]).populate('category', ["_id","title"]).populate({
      path: 'modifiers', 
      select: ["_id","title"],
      populate : [
        {
          path: 'stores',
          select: ["_id","title"]
        }]
    }).populate({ 
      path: 'taxes', 
      select: ["_id","title","tax_type","tax_rate"],
      populate : [{
          path: 'tax_type',
          select: ["_id","title"]
        },
        {
          path: 'stores',
          select: ["_id","title"]
        }]
      }).sort({ title: 1 });
    // .select('title -_id  category.categoryId');
    // result.exec(function (err, someValue) {
    //         if (err) return next(err);
    //         res.send(someValue);
    //     });
    // result = result.slice(startIndex, endIndex);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/storeItems", async (req, res) => {
  try {
    const { account } = req.authData;
    const { storeId } = req.query;

    var items = await ItemList.find({
      stores: { $elemMatch: { store: storeId } },
      account: account,
      deleted: 0,
    }).populate('stores.store', ["_id","title"]).populate('category', ["_id","title"]).populate({
      path: 'modifiers', 
      select: ["_id","title"],
      populate : [
        {
          path: 'stores',
          select: ["_id","title"]
        }]
    }).populate({ 
      path: 'taxes', 
      select: ["_id","title","tax_type","tax_rate"],
      populate : [{
          path: 'tax_type',
          select: ["_id","title"]
        },
        {
          path: 'stores',
          select: ["_id","title"]
        }]
      })
      .select([
        "_id",
        "title",
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
        "stores.store",
        "stores.inStock",
        "stores.lowStock",
        "modifiers",
        "taxes",
        "repoOnPos",
        "image",
        "color",
        "shape",
        "createdAt",
        "createdBy",
      ])
      .sort({ title: 1});
    let itemsObjectFilter = [];
    for (const item of items) {
      itemsObjectFilter.push({
        _id: item._id,
        title: item.title,
        category: item.category,
        availableForSale: item.availableForSale,
        soldByType: item.soldByType,
        price: item.price,
        cost: item.cost,
        sku: item.sku,
        barcode: item.barcode,
        trackStock: item.trackStock,
        compositeItem: item.compositeItem,
        stockQty: item.stockQty,
        varients: item.varients,
        storeId: item.stores[0].store._id,
        storeName: item.stores[0].store.title,
        storePrice: item.stores[0].price,
        inStock: item.stores[0].inStock,
        lowStock: item.stores[0].lowStock,
        modifiers: item.modifiers,
        taxes: item.taxes,
        repoOnPos: item.repoOnPos,
        image: item.image,
        color: item.color,
        shape: item.shape,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
      });
    }

    res.status(200).json(itemsObjectFilter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/searchByName", async (req, res) => {
  try {
    let { name, storeId } = req.query;
    const { account } = req.authData;

    let filters = {
      account: account,
      stores: { $elemMatch: { store: storeId } },
      title: { $regex: ".*" + name + ".*", $options: "i" },
    };
    var result = await ItemList.find(filters).populate('stores.store', ["_id","title"]).populate('category', ["_id","title"]).populate({
      path: 'modifiers', 
      select: ["_id","title"],
      populate : [
        {
          path: 'stores',
          select: ["_id","title"]
        }]
    }).populate({ 
      path: 'taxes', 
      select: ["_id","title","tax_type","tax_rate"],
      populate : [{
          path: 'tax_type',
          select: ["_id","title"]
        },
        {
          path: 'stores',
          select: ["_id","title"]
        }]
      }).sort({ title: 1 });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { account } = req.authData;
    let { search, stockFilter, categoryFilter, storeId } = req.query;
    search = typeof search !== "undefined" ? search.trim() : search;
    let storeFilter = {};
    if (storeId !== "0") {
      storeFilter.stores = { $elemMatch: { store: storeId } };
    }
    if (
      categoryFilter !== "-1" &&
      categoryFilter !== "0" &&
      categoryFilter !== undefined
    ) {
      storeFilter["category"] = categoryFilter;
    } else if(categoryFilter == "0"){
      storeFilter["category"] = null
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
    storeFilter.account = account;
    storeFilter.deleted = 0;

    var result = await ItemList.find(storeFilter).populate('stores.store', ["_id","title"]).populate('category', ["_id","title"]).populate({
      path: 'modifiers', 
      select: ["_id","title"],
      populate : [
        {
          path: 'stores',
          select: ["_id","title"]
        }]
    }).populate({ 
      path: 'taxes', 
      select: ["_id","title","tax_type","tax_rate"],
      populate : [{
          path: 'tax_type',
          select: ["_id","title"]
        },
        {
          path: 'stores',
          select: ["_id","title"]
        }]
      }).sort({ title: 1 });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/delete", async (req, res) => {
  try {
    var { ids } = req.body;
    const { _id, account } = req.authData;
    // ids.forEach(async (id) => {
    let del = await ItemList.updateMany(
      { _id: { $in: ids }, account: account },
      { $set: { deleted: 1, deletedAt: Date.now() } },
      {
        new: true,
        upsert: true,
      }
    );

    if (del.n > 0 && del.nModified > 0) {
      req.io.to(account).emit(ITEM_DELETE, { data: ids, user: _id });
    }
    // });
    var SKUs = await ItemList.find({
      _id: {$in: ids},
      account: account
    }).select(["sku","autoSKU"])
    
    let finalSKUs = SKUs.filter(itm => itm.autoSKU == true).map(function(obj) {
      return obj.sku;
    })
    if(finalSKUs.length > 0){
      let minSKU = min(finalSKUs) - 1
      if(minSKU !== "" && minSKU !== null && typeof minSKU != NaN && minSKU != -1){
        await SkuHistory.findOneAndUpdate(
          { account: account },
          { $set: {
            sku: minSKU,
            updatedBy: _id,
          } },
          {
            new: true,
            upsert: true, // Make this update into an upsert
          }
        );
      }
    }
    
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get_item_stores", async (req, res) => {
  try {
    const { account } = req.authData;
    const stores = await Store.find({ account: account }).sort({
      _id: "desc",
    });
    const taxes = await itemTax
      .find({ account: account })
      .sort({ _id: "desc" });
    let allStores = [];
    for (const store of stores) {
      allStores.push({
        // _id: store._id,
        // title: store.title,
        store: {
          _id: store._id,
        title: store.title
        },
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
            account: account,
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

router.get("/get_item_taxes", async (req, res) => {
  try {
    const { account } = req.authData;
    const stores = await Store.find({ account: account }).sort({
      _id: "desc",
    });
    const result = await itemTax
      .find({ account: account })
      .sort({ _id: "desc" });
    let taxes = [];
    for (const tax of result) {
      const storeTax = [];
      tax.stores !== undefined && tax.stores !== null && tax.stores.length > 0
        ? tax.stores.map((item) => {
            stores.map((str) => {
              if (item.storeId == str._id) {
                return storeTax.push({
                  storeId: item.storeId,
                  storeTitle: item.storeTitle,
                });
              }
            });
          })
        : [],
        taxes.push({
          _id: tax._id,
          title: tax.title,
          tax_rate: tax.tax_rate,
          allStores:
            tax.stores !== undefined &&
            tax.stores !== null &&
            tax.stores.length > 0
              ? tax.stores.length === stores.length
                ? true
                : false
              : false,
          stores: storeTax,
        });
    }
    res.status(200).json({ taxes: taxes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const get_items_taxes = async (account, itemTaxes) => {
  const stores = await Store.find({ account: account }).sort({
    _id: "desc",
  });
  let taxes = [];
  for (const tax_id of itemTaxes) {
    const result = await itemTax
      .find({ account: account, _id: tax_id.id })
      .sort({ _id: "desc" });
    for (const tax of result) {
      const storeTax = [];
      tax.stores !== undefined && tax.stores !== null && tax.stores.length > 0
        ? tax.stores.map((item) => {
            stores.map((str) => {
              if (item.storeId == str._id) {
                return storeTax.push({
                  storeId: item.storeId,
                  storeTitle: item.storeTitle,
                });
              }
            });
          })
        : [];
      taxes.push({
        id: tax._id,
        title: tax.title,
        tax_rate: tax.tax_rate,
        allStores:
          tax.stores !== undefined &&
          tax.stores !== null &&
          tax.stores.length > 0
            ? tax.stores.length === stores.length
              ? true
              : false
            : false,
        stores: storeTax,
      });
    }
  }
  return taxes;
};

router.get("/row/:id", async (req, res) => {
  try {
    const { account } = req.authData;
    const { id } = req.params;
    var result = await ItemList.findOne({
      _id: id,
      account: account,
      deleted: 0,
    }).populate('stores.store', ["_id","title"]).populate('category', ["_id","title"]).populate({
      path: 'modifiers', 
      select: ["_id","title"],
      populate : [
        {
          path: 'stores',
          select: ["_id","title"]
        }]
    }).populate({ 
      path: 'taxes', 
      select: ["_id","title","tax_type","tax_rate"],
      populate : [{
          path: 'tax_type',
          select: ["_id","title"]
        },
        {
          path: 'stores',
          select: ["_id","title"]
        }]
      }).sort({ _id: "desc" });
    if (result !== undefined && result !== null) {
      res.status(200).json(result);
    } else {
      res.status(200).json({ message: "No Item Found! "});
    }
    // newVarients = newVarients !== undefined && newVarients !== null ? newVarients : {};
    
    // result = result.slice(startIndex, endIndex);
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
        // console.log({ index: index, sku: element });
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

router.post("/validate_csv", async (req, res) => {
  try {
    var errors = [];
    let insertFile = [];
    let updatedFile = [];
    let data = [];
    let groupSkuErrors = [];
    let groupHandleErrors = [];
    let groupNameErrors = [];
    const { account, _id } = req.authData;
    let { csvData } = req.body;

    var csvFile = req.files ? req.files.csvFile : "";

    if (
      (!csvFile || typeof csvFile == "undefined" || csvFile == "") &&
      csvFile == ""
    ) {
      errors.push(`Invalid Csv File!`);
    }
    if (errors.length > 0) {
      res.status(400).send({ message: `Invalid Parameters!`, errors });
    } else {
      const imagesName = await uploadCsv([csvFile], `csv/`);
      if (imagesName.success === true) {
        var i = 0;
        var parser = fs
          .createReadStream(`uploads/csv/${imagesName.images[0]}`)
          .pipe(csv.parse({ headers: true, ignoreEmpty: true, trim: true }))
          .on("error", (error) => console.error(error))
          .on("data", async (row) => {
            // if (
            //   typeof row.Name === "undefined" ||
            //   typeof row.Name === "null" ||
            //   row.Name === null ||
            //   row.Name === undefined ||
            //   row.Name === ""
            // ) {
            //   groupNameErrors.push({
            //     index: i,
            //   });
            // }
            if (
              typeof row.SKU === "undefined" ||
              typeof row.SKU === "null" ||
              row.SKU === null ||
              row.SKU === undefined ||
              row.SKU === ""
            ) {
              groupSkuErrors.push({
                index: i,
              });
            }
            // if (
            //   typeof row.Handle === "undefined" ||
            //   typeof row.Handle === "null" ||
            //   row.Handle === null ||
            //   row.Handle === undefined ||
            //   row.Handle === ""
            // ) {
            //   groupHandleErrors.push({
            //     index: i,
            //   });
            // }
            i++;
            console.log(i);
          })
          .on("end", async (rowCount) => {
            console.log(`Parsed ${rowCount} rows`);
            await deleteFile(imagesName.images[0], "csv");
            // console.log(`Parsed ${rowCount} rows`, insertFile, updatedFile);
            if (
              typeof groupSkuErrors !== "undefined" &&
              typeof groupHandleErrors !== "undefined" &&
              typeof groupNameErrors !== "undefined"
            ) {
              if (
                groupSkuErrors.length > 0 ||
                groupHandleErrors.length > 0 ||
                groupNameErrors.length > 0
              ) {
                errors.push({
                  groupSkuErrors: groupSkuErrors,
                  groupHandleErrors: groupHandleErrors,
                  groupNameErrors: groupNameErrors,
                });
                res.status(400).json(errors);
              } else {
                res.status(200).json({
                  success: true,
                  message: `${rowCount} items will be import`,
                });
              }
            } else {
              res.status(200).json({
                success: true,
                message: `${rowCount} items will be import`,
              });
            }
          });
      }
    }
  } catch (err) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/save_csv", async (req, res) => {
  try {
    var errors = [];
    let insertFile = [];
    let updatedFile = [];
    let data = [];
    let groupSkuErrors = [];
    let groupHandleErrors = [];
    let groupNameErrors = [];
    const { account, _id } = req.authData;
    let { csvData } = req.body;

    var csvFile = req.files ? req.files.csvFile : "";

    if (
      (!csvFile || typeof csvFile == "undefined" || csvFile == "") &&
      csvFile == ""
    ) {
      errors.push(`Invalid Csv File!`);
      // errors.push({ name: `Invalid Name!` });
    }
    if (errors.length > 0) {
      res.status(400).send({ message: `Invalid Parameters!`, errors });
    } else {
      const imagesName = await uploadCsv([csvFile], `csv/`);
      if (imagesName.success === true) {
        var i = 0;
        var parser = fs
          .createReadStream(`uploads/csv/${imagesName.images[0]}`)
          .pipe(csv.parse({ headers: true, ignoreEmpty: true, trim: true }))
          .on("error", (error) => console.error(error))
          .on("data", async (row) => {
            parser.pause();
            if (
              typeof row.Name === "undefined" ||
              typeof row.Name === "null" ||
              row.Name === null ||
              row.Name === undefined ||
              row.Name === ""
            ) {
              groupNameErrors.push({
                index: i,
              });
            }
            if (
              typeof row.SKU === "undefined" ||
              typeof row.SKU === "null" ||
              row.SKU === null ||
              row.SKU === undefined ||
              row.SKU === ""
            ) {
              groupSkuErrors.push({
                index: i,
              });
            }
            if (
              typeof row.Handle === "undefined" ||
              typeof row.Handle === "null" ||
              row.Handle === null ||
              row.Handle === undefined ||
              row.Handle === ""
            ) {
              groupHandleErrors.push({
                index: i,
              });
            }
            i++;
            console.log("i", i);
            if (
              (typeof row.SKU !== "undefined" ||
                typeof row.SKU !== "null" ||
                row.SKU !== null ||
                row.SKU !== undefined ||
                row.SKU !== "") &&
              (row.Name !== "" ||
                row.Name !== undefined ||
                row.Name !== null ||
                typeof row.Name !== "undefined" ||
                typeof row.Name !== "null") &&
              (typeof row.Handle !== "undefined" ||
                typeof row.Handle !== "null" ||
                row.Handle !== null ||
                row.Handle !== undefined ||
                row.Handle !== "") &&
              row !== undefined
            ) {
              const handleExist = await ItemList.findOne({
                title: row.Name,
                sku: Number(row.SKU).toPrecision(),
                account: account,
                deleted: 0,
              }).sort({ _id: "desc" });
              const storeModifier = await createStoresFromCSV(
                row,
                _id,
                account
              );
              const varientValue1 = [];
              const varientValue2 = [];
              const varientValue3 = [];
              const varientName = [];
              if (
                row["Option 1 value"] !== "" ||
                row["Option 1 value"] !== undefined ||
                row["Option 1 value"] !== null
              ) {
                varientValue1.push({
                  price:
                    typeof row["Default price"] !== "undefined" &&
                    typeof row["Default price"] !== "null" &&
                    !isNaN(row["Default price"]) &&
                    row["Default price"] !== null &&
                    row["Default price"] !== ""
                      ? parseFloat(row["Default price"])
                      : 0,
                  cost:
                    typeof row.Cost !== "undefined" &&
                    typeof row.Cost !== "null" &&
                    !isNaN(row.Cost) &&
                    row.Cost !== null &&
                    row.Cost !== ""
                      ? parseFloat(row.Cost)
                      : 0,
                  sku: Number(row.SKU).toPrecision(),
                  barcode: Number(row.Barcode).toPrecision(),
                  variantName: row["Option 1 value"].trim(),
                });
              }
              if (varientValue1.length > 0) {
                varientName.push({
                  optionName: row["Option 1 name"].trim(),
                  optionValue: varientValue1,
                });
              }
              if (
                row["Option 2 name"] !== "" ||
                row["Option 2 name"] !== undefined ||
                row["Option 2 name"] !== null
              ) {
                if (
                  row["Option 2 value"] !== "" ||
                  row["Option 2 value"] !== undefined ||
                  row["Option 2 value"] !== null
                ) {
                  varientValue2.push({
                    price:
                      typeof row["Default price"] !== "undefined" &&
                      typeof row["Default price"] !== "null" &&
                      !isNaN(row["Default price"]) &&
                      row["Default price"] !== null &&
                      row["Default price"] !== ""
                        ? parseFloat(row["Default price"])
                        : 0,
                    cost:
                      typeof row.Cost !== "undefined" &&
                      typeof row.Cost !== "null" &&
                      row.Cost !== null &&
                      !isNaN(row.Cost) &&
                      row.Cost !== ""
                        ? parseFloat(row.Cost)
                        : 0,
                    sku: Number(row.SKU).toPrecision(),
                    barcode: Number(row.Barcode).toPrecision(),
                    variantName: row["Option 2 value"].trim(),
                  });
                }
                if (varientValue2.length > 0) {
                  varientName.push({
                    optionName: row["Option 2 name"].trim(),
                    optionValue: varientValue2,
                  });
                }
              }
              if (
                row["Option 3 name"] !== "" ||
                row["Option 3 name"] !== undefined ||
                row["Option 3 name"] !== null
              ) {
                if (
                  row["Option 3 value"] !== "" ||
                  row["Option 3 value"] !== undefined ||
                  row["Option 3 value"] !== null
                ) {
                  varientValue3.push({
                    price:
                      typeof row["Default price"] !== "undefined" &&
                      typeof row["Default price"] !== "null" &&
                      !isNaN(row["Default price"]) &&
                      row["Default price"] !== null &&
                      row["Default price"] !== ""
                        ? parseFloat(row["Default price"])
                        : 0,
                    cost:
                      typeof row.Cost !== "undefined" &&
                      typeof row.Cost !== "null" &&
                      !isNaN(row.Cost) &&
                      row.Cost !== null &&
                      row.Cost !== ""
                        ? parseFloat(row.Cost)
                        : 0,
                    sku: Number(row.SKU).toPrecision(),
                    barcode: Number(row.Barcode).toPrecision(),
                    variantName: row["Option 3 value"].trim(),
                  });
                }
                if (varientValue3.length > 0) {
                  varientName.push({
                    optionName: row["Option 3 name"].trim(),
                    optionValue: varientValue3,
                  });
                }
              }

              if (
                typeof handleExist !== "undefined" &&
                typeof handleExist !== "null" &&
                handleExist !== null
              ) {
                // console.log("call if");
                const existFile = updatedFile.filter(
                  (item) => item.name.trim() === row.Name.trim()
                );
                if (
                  existFile !== undefined &&
                  existFile !== null &&
                  existFile.length > 0
                ) {
                  await updatedFile.map((item) => {
                    if (
                      item.name.trim() === row.Name.trim() &&
                      Number(item.SKU).toPrecision() ===
                        Number(row.SKU).toPrecision()
                    ) {
                      return {
                        ...item,
                        item_id: handleExist._id,
                        title: row.Name.trim(),
                        account: account,
                        category: [],
                        soldByType:
                          row["Sold by weight"] == "N"
                            ? "Each"
                            : "Sold by weight",
                        price:
                          typeof row["Default price"] !== "undefined" &&
                          typeof row["Default price"] !== "null" &&
                          row["Default price"] !== null &&
                          !isNaN(row["Default price"]) &&
                          row["Default price"] !== ""
                            ? parseFloat(row["Default price"])
                            : 0,
                        cost:
                          typeof row.Cost !== "undefined" &&
                          typeof row.Cost !== "null" &&
                          row.Cost !== null &&
                          !isNaN(row.Cost) &&
                          row.Cost !== ""
                            ? parseFloat(row.Cost)
                            : 0,
                        sku: Number(row.SKU).toPrecision(),
                        barcode: Number(row.Barcode).toPrecision(),
                        trackStock: row["Track stock"] == "N" ? false : true,
                        stores: storeModifier.storeData,
                        modifiers: storeModifier.modifierData,
                        taxes: [],
                        repoOnPos: "Color_and_shape",
                        image: "",
                        color: "",
                        shape: "",
                        availableForSale: false,
                        createdBy: _id,
                        varients: varientName.map((vartName) => {
                          return item.varients.map((vart) => {
                            if (vart.optionName === vartName.optionName) {
                              return {
                                ...vart,
                                optionValue: [
                                  ...optionValue,
                                  ...vartName.optionValue,
                                ],
                              };
                            }
                            return vart;
                          });
                        }),
                      };
                    }
                    return item;
                  });
                } else {
                  await updatedFile.push({
                    item_id: handleExist._id,
                    title: row.Name.trim(),
                    account: account,
                    category: [],
                    soldByType:
                      row["Sold by weight"] == "N" ? "Each" : "Sold by weight",
                    price:
                      typeof row["Default price"] !== "undefined" &&
                      typeof row["Default price"] !== "null" &&
                      row["Default price"] !== null &&
                      !isNaN(row["Default price"]) &&
                      row["Default price"] !== ""
                        ? parseFloat(row["Default price"])
                        : 0,
                    cost:
                      typeof row.Cost !== "undefined" &&
                      typeof row.Cost !== "null" &&
                      row.Cost !== null &&
                      !isNaN(row.Cost) &&
                      row.Cost !== ""
                        ? parseFloat(row.Cost)
                        : 0,
                    sku: Number(row.SKU).toPrecision(),
                    barcode: Number(row.Barcode).toPrecision(),
                    trackStock: row["Track stock"] == "N" ? false : true,
                    varients: varientName.length === 0 ? null : varientName,
                    stores: storeModifier.storeData,
                    modifiers: storeModifier.modifierData,
                    taxes: [],
                    repoOnPos: "Color_and_shape",
                    image: "",
                    color: "",
                    shape: "",
                    availableForSale: false,
                    createdBy: _id,
                  });
                }

                // console.log(row);
                // insertFile.push(row);
              } else {
                // console.log("call else");
                let existFile = [];
                if (row !== undefined) {
                  if (
                    insertFile !== undefined &&
                    insertFile !== null &&
                    row !== undefined &&
                    insertFile.length > 0
                  ) {
                    existFile = (insertFile || []).filter(
                      (item) => item.name.trim() === row.Name.trim()
                    );
                  }
                  if (
                    existFile !== undefined &&
                    existFile !== null &&
                    row !== undefined &&
                    existFile.length > 0
                  ) {
                    await insertFile.map((item) => {
                      if (
                        item.name.trim() === row.Name.trim() &&
                        Number(item.SKU).toPrecision() ===
                          Number(row.SKU).toPrecision()
                      ) {
                        return {
                          ...item,
                          title: row.Name.trim(),
                          account: account,
                          category: [],
                          soldByType:
                            row["Sold by weight"] == "N"
                              ? "Each"
                              : "Sold by weight",
                          price:
                            typeof row["Default price"] !== "undefined" &&
                            typeof row["Default price"] !== "null" &&
                            row["Default price"] !== null &&
                            !isNaN(row["Default price"]) &&
                            row["Default price"] !== ""
                              ? parseFloat(row["Default price"])
                              : 0,
                          cost:
                            typeof row.Cost !== "undefined" &&
                            typeof row.Cost !== "null" &&
                            row.Cost !== null &&
                            !isNaN(row.Cost) &&
                            row.Cost !== ""
                              ? parseFloat(row.Cost)
                              : 0,
                          sku: Number(row.SKU).toPrecision(),
                          barcode: Number(row.Barcode).toPrecision(),
                          trackStock: row["Track stock"] == "N" ? false : true,
                          stores: storeModifier.storeData,
                          modifiers: storeModifier.modifierData,
                          taxes: [],
                          repoOnPos: "Color_and_shape",
                          image: "",
                          color: "",
                          shape: "",
                          availableForSale: false,
                          createdBy: _id,
                          varients: varientName.map((vartName) => {
                            return item.varients.map((vart) => {
                              if (vart.optionName === vartName.optionName) {
                                return {
                                  ...vart,
                                  optionValue: [
                                    ...optionValue,
                                    ...vartName.optionValue,
                                  ],
                                };
                              }
                              return vart;
                            });
                          }),
                        };
                      }
                      return item;
                    });
                  } else {
                    await insertFile.push({
                      title: row.Name.trim(),
                      account: account,
                      category: [],
                      soldByType:
                        row["Sold by weight"] == "N"
                          ? "Each"
                          : "Sold by weight",
                      price:
                        typeof row["Default price"] !== "undefined" &&
                        typeof row["Default price"] !== "null" &&
                        row["Default price"] !== null &&
                        !isNaN(row["Default price"]) &&
                        row["Default price"] !== ""
                          ? parseFloat(row["Default price"])
                          : 0,
                      cost:
                        typeof row.Cost !== "undefined" &&
                        typeof row.Cost !== "null" &&
                        row.Cost !== null &&
                        !isNaN(row.Cost) &&
                        row.Cost !== ""
                          ? parseFloat(row.Cost)
                          : 0,
                      sku: Number(row.SKU).toPrecision(),
                      barcode: Number(row.Barcode).toPrecision(),
                      trackStock: row["Track stock"] == "N" ? false : true,
                      varients: varientName.length === 0 ? null : varientName,
                      stores: storeModifier.storeData,
                      modifiers: storeModifier.modifierData,
                      taxes: [],
                      repoOnPos: "Color_and_shape",
                      image: "",
                      color: "",
                      shape: "",
                      availableForSale: false,
                      createdBy: _id,
                    });
                  }
                }
              }
            }
            parser.resume();
          })
          .on("end", async (rowCount) => {
            console.log(`Parsed ${rowCount} rows`);
            await deleteFile(imagesName.images[0], "csv");
            // console.log(`Parsed ${rowCount} rows`, insertFile, updatedFile);
            if (
              typeof groupSkuErrors !== "undefined" &&
              typeof groupHandleErrors !== "undefined" &&
              typeof groupNameErrors !== "undefined"
            ) {
              if (
                groupSkuErrors.length > 0 ||
                groupHandleErrors.length > 0 ||
                groupNameErrors.length > 0
              ) {
                errors.push({
                  groupSkuErrors: groupSkuErrors,
                  groupHandleErrors: groupHandleErrors,
                  groupNameErrors: groupNameErrors,
                });
                res.status(400).json(errors);
              }
            }

            if (
              insertFile !== undefined &&
              insertFile !== null &&
              insertFile.length > 0
            ) {
              try {
                ItemList.insertMany(insertFile)
                  .then(() => {
                    console.log("Data inserted"); // Success
                    res
                      .status(200)
                      .send({ message: "Record Save Successfully" });
                  })
                  .catch((error) => {
                    console.log(error); // Failure
                    res.status(400).json({ message: error.message });
                  });
              } catch (error) {
                console.log("Durning Insert", error.message);
                res.status(400).json({ message: error.message });
              }
            }
          });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const createStoresFromCSV = (item, user_id, account) => {
  return new Promise(async (resolve, reject) => {
    const modifierData = [];
    const storeData = [];

    try {
      var keys = Object.keys(item);
      (keys || []).map(async (ite, iteIndex) => {
        let getStore = ite.match(/([^[\]]+|\[\])/g).map(function (val) {
          return val === "[]" ? null : val;
        })[1];
        const stores = await Store.find().sort({
          _id: "desc",
        });
        (stores || []).map(async (stor, storIndex) => {
          if (getStore !== undefined && getStore !== null) {
            // if (ite == `Available for sale [${stor.title}]`) {
            if (getStore.trim() == stor.title.trim()) {
              return storeData.push({
                id: stor._id,
                title: stor.title,
                price:
                  typeof item[`Price [${stor.title}]`] !== "undefined" &&
                  typeof item[`Price [${stor.title}]`] !== "null" &&
                  !isNaN(item[`Price [${stor.title}]`]) &&
                  item[`Price [${stor.title}]`] !== null &&
                  item[`Price [${stor.title}]`] !== ""
                    ? parseFloat(item[`Price [${stor.title}]`])
                    : 0,
                inStock:
                  typeof item[`In stock [${stor.title}]`] !== "undefined" &&
                  typeof item[`In stock [${stor.title}]`] !== "null" &&
                  !isNaN(item[`In stock [${stor.title}]`]) &&
                  item[`In stock [${stor.title}]`] !== null &&
                  item[`In stock [${stor.title}]`] !== ""
                    ? item[`In stock [${stor.title}]`]
                    : 0,
                lowStock:
                  typeof item[`Low stock [${stor.title}]`] !== "undefined" &&
                  typeof item[`Low stock [${stor.title}]`] !== "null" &&
                  !isNaN(item[`Low stock [${stor.title}]`]) &&
                  item[`Low stock [${stor.title}]`] !== null &&
                  item[`Low stock [${stor.title}]`] !== ""
                    ? item[`Low stock [${stor.title}]`]
                    : 0,
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
                    account: account,
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
                createdBy: user_id,
                account: account,
              });
              try {
                const result = await newStore.save();
                return storeData.push({
                  id: result._id,
                  title: result.title,
                  price:
                    typeof item[`Price [${getStore}]`] !== "undefined" &&
                    typeof item[`Price [${getStore}]`] !== "null" &&
                    !isNaN(item[`Price [${getStore}]`]) &&
                    item[`Price [${getStore}]`] !== null &&
                    item[`Price [${getStore}]`] !== ""
                      ? parseFloat(item[`Price [${getStore}]`])
                      : 0,
                  inStock:
                    typeof item[`In stock [${getStore}]`] !== "undefined" &&
                    typeof item[`In stock [${getStore}]`] !== "null" &&
                    !isNaN(item[`In stock [${getStore}]`]) &&
                    item[`In stock [${getStore}]`] !== null &&
                    item[`In stock [${getStore}]`] !== ""
                      ? item[`In stock [${getStore}]`]
                      : 0,
                  lowStock:
                    typeof item[`Low stock [${getStore}]`] !== "undefined" &&
                    typeof item[`Low stock [${getStore}]`] !== "null" &&
                    !isNaN(item[`Low stock [${getStore}]`]) &&
                    item[`Low stock [${getStore}]`] !== null &&
                    item[`Low stock [${getStore}]`] !== ""
                      ? item[`Low stock [${getStore}]`]
                      : 0,
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
                      account: account,
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
        try {
          const modifier = await Modifier.find().sort({
            _id: "desc",
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
        } catch (err) {
          console.log("Modifier Catch", err.message);
        }
      });
      resolve({ storeData, modifierData, success: true });
    } catch (err) {
      console.log("createStoresFromCSV Error", err.message);
      resolve({ storeData: [], modifierData: [], success: false });
    }
  });
};

router.use("/categories", categoriesRouter);
router.use("/discount", discountRouter);
router.use("/modifier", modifierRouter);
router.use("/items", ItemList);
router.use("/stock", stockRouter);
module.exports = router;
