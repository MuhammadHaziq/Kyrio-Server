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
    cash_received,
    refund_amount,
    items,
    discounts,
    variant,
    store,
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
    let total_discount = 0;
    let total_tax = 0;
    let itemTotalPrices = 0;
    
    for(const item of items){
      itemTotalPrices = parseFloat(itemTotalPrices) + parseFloat(item.price)
      if(typeof item.discounts !== "undefined" && item.discounts.length > 0){
      }
      if(typeof item.modifiers !== "undefined" && item.modifiers.length > 0){
        for(const modifier of item.modifiers){
          for(const option of modifier.options){
            itemTotalPrices = parseFloat(itemTotalPrices) + parseFloat(option.price)
          }
        }
      }
      if(typeof item.taxes !== "undefined" && item.taxes.length > 0){
        for(const tax of item.taxes){
          total_tax = parseFloat(total_tax) + parseFloat(((tax.value/100) * item.price));
          if(tax.type == "excluded"){
            itemTotalPrices =  parseFloat(itemTotalPrices) + parseFloat(((tax.value/100) * item.price))
          }
        }
      }
    }
    for(const discount of discounts){
      if(discount.type == "%"){
        total_discount = parseFloat(total_discount) + parseFloat(((discount.value/100) * itemTotalPrices))
      } else {
        total_discount = parseFloat(total_discount) + parseFloat(discount.value)
      }
    }
    let total_price = itemTotalPrices;
    let total_after_discount = parseFloat(itemTotalPrices) - parseFloat(total_discount);
    let cash_return = parseFloat(cash_received) - parseFloat(total_after_discount);
    try {
      const newSales = await new Sales({
        ticket_name,
        comments,
        open,
        total_price,
        cash_received,
        cash_return,
        total_after_discount,
        total_discount,
        total_tax,
        refund_amount,
        items,
        discounts,
        variant,
        store,
        created_by: _id,
      }).save();
      res.status(200).json(newSales);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.patch("/", async (req, res) => {
  const {
    sale_id,
    ticket_name,
    comments,
    open,
    total_price,
    cash_received,
    cash_return,
    refund_amount,
    items,
    discounts,
    variant,
    store,
    taxes,
  } = req.body;
  var errors = [];
  if (!sale_id || typeof sale_id == "undefined" || sale_id == "") {
    errors.push({ sale_id: `Invalid Sale ID!` });
  }
  if (!ticket_name || typeof ticket_name == "undefined" || ticket_name == "") {
    errors.push({ ticket_name: `Invalid ticket_name!` });
  }
  if (!total_price || typeof total_price == "undefined" || total_price == "") {
    errors.push({ total_price: `Invalid Total Price!` });
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
        refund_amount,
        items,
        discounts,
        variant,
        store,
        taxes,
        created_by: _id,
      };
      await Sales.updateOne({ _id: sale_id }, data);
      let getUpdatedSale = await Sales.findOne({ _id: sale_id });
      res.status(200).json(getUpdatedSale);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.patch("/refund", async (req, res) => {
  const {
    sale_id,
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
    for (const item of items) {
      await Sales.updateOne(
        {$and: [{ _id: sale_id }, { "items.id": item.id }]},
        {
          $set: {
            "items.$.refund_quantity": item.refund_quantity,
            "refund_status": item.refund_quantity == item.quantity ? "Full" : "Partial Refund"
          },
        }
      );
    }
      let getRefundedSale = await Sales.findOne({ _id: sale_id });
      res.status(200).json(getRefundedSale);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
