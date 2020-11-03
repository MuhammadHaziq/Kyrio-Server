import express from "express";
import Sales from "../../modals/sales/sales";
import Tickets from "../../modals/sales/tickets";
var mongoose = require('mongoose');
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    var allSales = await Sales.find().sort({ _id: "desc" });
    res.status(200).json(allSales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { ticket, sale_id } = req.body;
    let check = mongoose.Types.ObjectId.isValid(sale_id);
    let searchResult; 
    if(check){
      searchResult = await Sales.find({ $or:[{'ticket_name': ticket}, {'_id': sale_id}] }).sort({ _id: "desc" });
    } else {
      searchResult = await Sales.find({ $or:[{'ticket_name': ticket}] }).sort({ _id: "desc" });
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
    comments,
    open,
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
    const { _id } = req.authData;
    // let lastSaleRefNo = await Sales.find({ "store.id": store.id });
    
    // let maxRefNo = lastSaleRefNo.map(itm => {return itm.refNo} )
    // console.log(maxRefNo)
    // let refNo = Math.max(...maxRefNo) + 1;
    // if(isNaN(refNo) || refNo == null || refNo == "-Infinity"){
    //   refNo = pad(1,"5")
    // } else{
    //   refNo = pad(refNo,"5")
    // }
    
    
    
    try {
      const newSales = await new Sales({
        ticket_name,
        // refNo,
        comments,
        open,
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
function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}
router.patch("/", async (req, res) => {
  const {
    sale_id,
    ticket_name,
    comments,
    open,
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
  if (!sale_id || typeof sale_id == "undefined" || sale_id == "") {
    errors.push({ sale_id: `Invalid Sale ID!` });
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
    const { _id } = req.authData;
    try {
    
      let data = {
        ticket_name,
        comments,
        open,
        total_price,
        cash_received,
        cash_return,
        total_after_discount,
        refund_status: "",
        refund_amount: 0,
        total_discount,
        total_tax,
        items,
        discounts,
        variant,
        store,
        created_by: _id,
        created_at
      };
      await Sales.updateOne({ _id: sale_id }, data);
      let getUpdatedSale = await Sales.findOne({ _id: sale_id });
      if(getUpdatedSale == null){
        res.status(200).json({message: "No Data Found! Invalid Sale ID"});
      }else{
        res.status(200).json(getUpdatedSale);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.patch("/refund", async (req, res) => {
  const {
    sale_id,
    refund_amount,
    total_price,
    cash_received,
    cash_return,
    total_after_discount,
    total_discount,
    total_tax,
    items,
  } = req.body;
  var errors = [];
  if (!sale_id || typeof sale_id == "undefined" || sale_id == "") {
    errors.push({ sale_id: `Invalid Sale ID!` });
  }
  if (typeof items == "undefined" || items.length <= 0 || items == "") {
    errors.push({ items: `Invalid items!` });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    try {
      let getRefundedSale = await Sales.findOne({ _id: sale_id });
      if(getRefundedSale){
        for (const item of items) {
          await Sales.updateOne(
              {$and: [{ _id: sale_id }, { "items.id": item.id }]},
              {
                $set: {
                  "items.$.refund_quantity": item.refund_quantity,
                  "refund_status": item.refund_quantity == item.quantity ? "Full" : "Partial Refund",
                  "total_price": total_price,
                  "cash_received": cash_received,
                  "total_after_discount": total_after_discount,
                  "cash_return": cash_return,
                  "total_discount": total_discount,
                  "total_tax": total_tax,
                  "refund_amount": refund_amount
                },
              }
            )
          }
      
        getRefundedSale = await Sales.findOne({ _id: sale_id });
        res.status(200).json(getRefundedSale);
      } else {
        res.status(404).json({message: "No Data Found!"});
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
