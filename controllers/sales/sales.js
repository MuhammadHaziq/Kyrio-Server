import express from "express";
import Sales from "../../modals/sales/sales";
import ItemList from "../../modals/items/ItemList";
var mongoose = require('mongoose');
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const { accountId } = req.authData;
    var allSales = await Sales.find({accountId: accountId}).sort({ _id: "desc" });
    res.status(200).json(allSales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { ticket, sale_id } = req.body;
    const { accountId } = req.authData;
    let check = mongoose.Types.ObjectId.isValid(sale_id);
    let searchResult; 
    if(check){
      searchResult = await Sales.find({ $or:[{'ticket_name': ticket}, {'_id': sale_id}], accountId: accountId }).sort({ _id: "desc" });
    } else {
      searchResult = await Sales.find({ $or:[{'ticket_name': ticket}], accountId: accountId }).sort({ _id: "desc" });
    }
    
    res.status(200).json(searchResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    let result = await Sales.deleteOne({ _id: id });

    res.status(200).json({ message: "deleted", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/", async (req, res) => {
  const {
    ticket_name,
    receipt_type,
    comments,
    open,
    receipt_number,
    sub_total,
    sale_timestamp,
    completed,
    total_price,
    cash_received,
    cash_return,
    total_after_discount,
    total_discount,
    total_tax,
    items,
    discounts,
    variant,
    store,
    created_at
  } = req.body;

  var errors = [];
  if (!receipt_number || typeof receipt_number == "undefined" || receipt_number == "") {
    errors.push({ receipt_number: `Invalid Receipt No!` });
  }
  if (!receipt_type || typeof receipt_type == "undefined" || receipt_type == "") {
    errors.push({ receipt_type: `Invalid Receipt Type!` });
  }
  if (!ticket_name || typeof ticket_name == "undefined" || ticket_name == "") {
    errors.push({ ticket_name: `Invalid ticket_name!` });
  }
  if (typeof items == "undefined" || items.length <= 0 || items == "") {
    errors.push({ items: `Invalid items!` });
  }
  if (typeof store == "undefined" || store == "") {
    errors.push({ store: `Invalid store!` });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id, accountId } = req.authData;
    // let lastSaleRefNo = await Sales.find({ "store.id": store.id });
    
    // let maxRefNo = lastSaleRefNo.map(itm => {return itm.refNo} )
    // console.log(maxRefNo)
    // let refNo = Math.max(...maxRefNo) + 1;
    // if(isNaN(refNo) || refNo == null || refNo == "-Infinity"){
    //   refNo = pad(1,"5")
    // } else{
    //   refNo = pad(refNo,"5")
    // }
    // console.log(store)
    for(const item of items){
      if(item.trackStock) {
        var storeItem = await ItemList.findOne({
          _id: item.id,
          stores: { $elemMatch: { id: store.id } },
          accountId: accountId,
        }).select([
            "stockQty",
            "stores.price",
            "stores.inStock",
            "stores.lowStock",
          ]);
          let storeQty = parseInt(storeItem.stores[0].inStock) - parseInt(item.quantity) 
          let itemQty = parseInt(storeItem.stockQty) - parseInt(item.quantity) 
         await ItemList.updateOne(
          {$and: [{ _id: item.id }, { "stores.id": store.id }]},
          {  
          $set: {
            "stockQty": itemQty,
            "stores.$.inStock": storeQty
          }
        });
      }
    }
    
    try {
      const newSales = await new Sales({
        receipt_number,
        ticket_name,
        receipt_type,
        accountId,
        sub_total,
        sale_timestamp,
        comments,
        open,
        completed,
        total_price,
        cash_received,
        cash_return,
        total_after_discount,
        total_discount,
        total_tax,
        refund_status: "",
        refund_amount: 0,
        items,
        discounts,
        variant,
        store,
        created_by: _id,
        created_at
      }).save();
      res.status(200).json(newSales);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

router.post("/refund", async (req, res) => {
  const {
    receipt_number,
    ticket_name,
    receipt_type,
    refund_for,
    comments,
    open,
    sub_total,
    sale_timestamp,
    completed,
    total_price,
    cash_received,
    cash_return,
    total_after_discount,
    total_discount,
    total_tax,
    items,
    discounts,
    variant,
    store,
    created_at
  } = req.body;

  var errors = [];
  if (!receipt_number || typeof receipt_number == "undefined" || receipt_number == "") {
    errors.push({ receipt_number: `Invalid Receipt No!` });
  }
  if (!receipt_type || typeof receipt_type == "undefined" || receipt_type == "") {
    errors.push({ receipt_type: `Invalid Receipt Type!` });
  }
  if (!ticket_name || typeof ticket_name == "undefined" || ticket_name == "") {
    errors.push({ ticket_name: `Invalid ticket_name!` });
  }
  if (typeof items == "undefined" || items.length <= 0 || items == "") {
    errors.push({ items: `Invalid items!` });
  }
  if (typeof store == "undefined" || store == "") {
    errors.push({ store: `Invalid store!` });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id, accountId } = req.authData;

    let getSale = await Sales.findOne({$and: [{ receipt_number: refund_for }, { accountId: accountId }]});
      if(getSale){
     
    for(const item of items){
      await Sales.updateOne(
        {$and: [{ _id: getSale._id }, { "items.id": item.id }]},
        {
          $set: {
            "items.$.refund_quantity": item.quantity,
            "updated_at": created_at
          },
        }
      )
      if(item.trackStock) {
        var storeItem = await ItemList.findOne({
          _id: item.id,
          stores: { $elemMatch: { id: store.id } },
          accountId: accountId,
        }).select([
            "stockQty",
            "stores.price",
            "stores.inStock",
            "stores.lowStock",
          ]);
          if(storeItem){
          let storeQty = parseInt(storeItem.stores[0].inStock) + parseInt(item.quantity) 
          let itemQty = parseInt(storeItem.stockQty) + parseInt(item.quantity) 
          await ItemList.updateOne(
                  {$and: [{ _id: item.id }, { "stores.id": store.id }]},
                  {  
                  $set: {
                    "stockQty": itemQty,
                    "stores.$.inStock": storeQty
                  }
                });
          }
      }
    }
    try {
      const newRefund = await new Sales({
        receipt_number,
        ticket_name,
        receipt_type,
        refund_for,
        accountId,
        sub_total,
        sale_timestamp,
        comments,
        open,
        completed,
        total_price,
        cash_received,
        cash_return,
        total_after_discount,
        total_discount,
        total_tax,
        refund_status: "",
        refund_amount: 0,
        items,
        discounts,
        variant,
        store,
        created_by: _id,
        created_at
      }).save();
      let refundedSale = await Sales.findOne({$and: [{ _id: getSale._id }, { accountId: accountId }]});
      res.status(200).json({refundReceipt: newRefund, saleReceipt: refundedSale});
    
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(404).json({message: "No Data Found!"});
  }
  }
});
router.patch("/cancel", async (req, res) => {
  const {
    receipt_number,
    storeId,
    cancelled_at
  } = req.body;

  var errors = [];
  if (!receipt_number || typeof receipt_number == "undefined" || receipt_number == "") {
    errors.push({ receipt_number: `Invalid Receipt No!` });
  }
  if (!cancelled_at || typeof cancelled_at == "undefined" || cancelled_at == "") {
    errors.push({ cancelled_at: `Invalid Cancelled At!` });
  }
  if (typeof storeId == "undefined" || storeId == "") {
    errors.push({ storeId: `Invalid store ID!` });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id, accountId } = req.authData;

    let getSale = await Sales.findOne({$and: [{ receipt_number: receipt_number }, { accountId: accountId }, { "store.id": storeId }]});
      if(getSale){
     
    for(const item of getSale.items){
     
      if(item.trackStock) {
        
        var storeItem = await ItemList.findOne({
          _id: item.id,
          stores: { $elemMatch: { id: storeId } },
          accountId: accountId,
        }).select([
            "stockQty",
            "stores.price",
            "stores.inStock",
            "stores.lowStock",
          ]);
          
          if(storeItem){
            let storeQty = parseInt(storeItem.stores[0].inStock);
            let itemQty = parseInt(storeItem.stockQty);
            if(getSale.receipt_type == "REFUND"){
              storeQty = parseInt(storeItem.stores[0].inStock) - parseInt(item.quantity) 
              itemQty = parseInt(storeItem.stockQty) - parseInt(item.quantity) 
            } else {
              storeQty = parseInt(storeItem.stores[0].inStock) + parseInt(item.quantity) 
              itemQty = parseInt(storeItem.stockQty) + parseInt(item.quantity) 
            }
          
          await ItemList.updateOne(
                  {$and: [{ _id: item.id }, { "stores.id": storeId }]},
                  {  
                  $set: {
                    "stockQty": itemQty,
                    "stores.$.inStock": storeQty
                  }
                });
          }
      }
    }
    try {
      let cancelledSale = await Sales.findOneAndUpdate({ _id: getSale._id }, {cancelled_at: cancelled_at}, {
        new: true,
        upsert: true, // Make this update into an upsert
      });
      res.status(200).json(cancelledSale);
    
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(404).json({message: "No Data Found!"});
  }
  }
});


module.exports = router;
