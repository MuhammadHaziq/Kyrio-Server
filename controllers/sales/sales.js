import express from "express";
import Sales from "../../modals/sales/sales";
import ItemList from "../../modals/items/ItemList";
import Store from "../../modals/Store";
import { REFUND_RECEIPT, ITEM_STOCK_UPDATE, RECEIPT_CANCELED } from "../../sockets/events";
import validator from "email-validator";
import { sendReceiptEmail } from "../../libs/sendEmail";
import POS_Device from "../../modals/POS_Device";
var mongoose = require('mongoose');
const router = express.Router();

router.get("/send", async (req, res) => {
  try {
    const { account, platform } = req.authData;
    const { receipt_id, email } = req.query;
    if (validator.validate(email)) {
      let result = await Sales.findOne({ _id: receipt_id })

      // let emailMessage = {
      //   businessName: userResult.account.businessName,
      //   email: userResult.email,
      //   _id: userResult._id,
      //   from: "info@kyrio.com",
      // };
      sendReceiptEmail(email, result);
      res.send(result);
    } else {
      res.status(422).send({
        type: "email",
        message: "Invalid Email Address",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/all", async (req, res) => {
  try {
    const { account, platform } = req.authData;
    const { update_at } = req.query;
    let filter = { account: account, cancelled_at: null }

    let isoDate = new Date(update_at);
    if (platform === "pos") {
      filter.updated_at = { $gte: isoDate }
    }
    var allSales = await Sales.find(filter).sort({ _id: "desc" });
    res.status(200).json(allSales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { ticket, sale_id } = req.body;
    const { account } = req.authData;
    let check = mongoose.Types.ObjectId.isValid(sale_id);
    let searchResult;
    if (check) {
      searchResult = await Sales.find({ $or: [{ 'ticket_name': ticket }, { '_id': sale_id }], account: account }).sort({ _id: "desc" });
    } else {
      searchResult = await Sales.find({ $or: [{ 'ticket_name': ticket }], account: account }).sort({ _id: "desc" });
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
  var {
    ticket_name,
    receipt_type,
    comments,
    open,
    receipt_number,
    order_number,
    sub_total,
    sale_timestamp,
    completed,
    total_price,
    cost_of_goods,
    cash_received,
    cash_return,
    total_discount,
    total_tax,
    total_tax_included,
    dining_option,
    customer,
    payment_method,
    cashier,
    device,
    items,
    discounts,
    store,
    created_at
  } = req.body;

  if (sale_timestamp !== "" && sale_timestamp !== null) {
    sale_timestamp = sale_timestamp
  } else {
    sale_timestamp = Date.now();
  }
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
    const { _id, account } = req.authData;
    let stockNotification = {
      store,
      itemsList: []
    }
    for (const item of items) {
      if (item.track_stock) {
        var storeItem = await ItemList.findOne({
          _id: item.id,
          stores: { $elemMatch: { store: store._id } },
          account: account,
        }).select([
          "stockQty",
          "stores.price",
          "stores.inStock",
          "stores.lowStock",
        ]);
        if (storeItem) {
          let storeQty = typeof storeItem.stores !== "undefined" ? parseInt(storeItem.stores[0].inStock) - parseInt(item.quantity) : parseInt(item.quantity)
          let itemQty = parseInt(storeItem.stockQty) - parseInt(item.quantity)
          await ItemList.updateOne(
            { $and: [{ _id: item.id }, { "stores.store": store._id }] },
            {
              $set: {
                "stockQty": itemQty,
                "stores.$.inStock": storeQty
              }
            });
          stockNotification.itemsList.push({
            _id: item.id,
            name: item.name,
            storeQty: storeQty,
            itemQty: itemQty
          })
        }
      }
    }
    try {
      let orderNo = parseInt(order_number.split("-")[2]);

      const newSales = await new Sales({
        receipt_number,
        order_number: orderNo,
        ticket_name,
        receipt_type,
        account,
        sub_total,
        sale_timestamp,
        comments,
        open,
        completed,
        total_price,
        cost_of_goods,
        cash_received,
        cash_return,
        total_discount,
        total_tax,
        total_tax_included,
        refund_status: "",
        refund_amount: 0,
        items,
        discounts,
        customer,
        dining_option,
        store,
        payment_method,
        cashier,
        device,
        created_by: _id,
        user: _id,
        created_at: sale_timestamp !== null ? sale_timestamp : created_at,
        updated_at: sale_timestamp !== null ? sale_timestamp : created_at,
      }).save();
      let noOfSales = parseInt(receipt_number.split("-")[1]);

      await POS_Device.updateOne(
        { _id: device._id },
        {
          $set: {
            noOfSales: noOfSales,
            order_number: orderNo
          },
        }
      );

      req.io.to(account).emit(ITEM_STOCK_UPDATE, { app: stockNotification, backoffice: stockNotification, user: _id, account: account });

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
    cost_of_goods,
    cash_received,
    refund_amount,
    cash_return,
    total_discount,
    dining_option,
    total_tax,
    total_tax_included,
    items,
    discounts,
    customer,
    payment_method,
    cashier,
    device,
    store,
    created_at
  } = req.body;

  var errors = [];
  if (!refund_for || typeof refund_for == "undefined" || refund_for == "") {
    errors.push({ refund_for: `Invalid Refund For!` });
  }
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
    const { _id, account } = req.authData;

    let getSale = await Sales.findOne({ $and: [{ receipt_number: refund_for }, { account: account }] });
    if (getSale) {
      let stockNotification = {
        store,
        itemsList: []
      }
      for (const item of items) {
        await Sales.updateOne(
          { $and: [{ _id: getSale._id }, { "items.id": item.id }] },
          {
            $set: {
              "items.$.refund_quantity": item.quantity,
              "updated_at": created_at
            },
          }
        )
        if (item.track_stock) {
          var storeItem = await ItemList.findOne({
            _id: item.id,
            // stores: { $elemMatch: { id: store.id } },
            stores: { $elemMatch: { store: store._id } },
            account: account,
          }).select([
            "stockQty",
            "stores.price",
            "stores.inStock",
            "stores.lowStock",
          ]);
          if (storeItem) {
            let storeQty = parseInt(storeItem.stores[0].inStock) + parseInt(item.quantity)
            let itemQty = parseInt(storeItem.stockQty) + parseInt(item.quantity)
            await ItemList.updateOne(
              { $and: [{ _id: item.id }, { "stores.store": store._id }] },
              {
                $set: {
                  "stockQty": itemQty,
                  "stores.$.inStock": storeQty
                }
              });
            stockNotification.itemsList.push({
              _id: item.id,
              name: item.name,
              storeQty: storeQty,
              itemQty: itemQty
            })
          }
        }
      }
      try {
        const newRefund = await new Sales({
          receipt_number,
          ticket_name,
          receipt_type,
          refund_for,
          account,
          sub_total,
          sale_timestamp,
          comments,
          open,
          completed,
          total_price,
          cost_of_goods,
          cash_received,
          cash_return,
          total_discount,
          total_tax,
          total_tax_included,
          refund_status: "",
          refund_amount,
          items,
          discounts,
          dining_option,
          customer,
          payment_method,
          cashier,
          device,
          store,
          created_by: _id,
          user: _id,
          created_at: sale_timestamp !== null ? sale_timestamp : created_at,
          updated_at: sale_timestamp !== null ? sale_timestamp : created_at,
        }).save();

        let noOfSales = receipt_number.split("_")[1];

        await POS_Device.updateOne(
          { _id: device._id },
          {
            $set: {
              noOfSales: noOfSales
            },
          }
        );

        let refundedSale = await Sales.findOne({ $and: [{ _id: getSale._id }, { account: account }] });
        req.io.to(account).emit(ITEM_STOCK_UPDATE, { app: stockNotification, backoffice: stockNotification, user: _id, account: account });
        req.io.to(account).emit(REFUND_RECEIPT, { app: { refundReceipt: newRefund, saleReceipt: refundedSale }, backoffice: {}, user: _id, account: account });
        res.status(200).json(newRefund);

      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(400).json({ message: "No Sale Data Found! Invalid Refund" });
    }
  }
});

router.get("/check/:receipt_number", async (req, res) => {
  const { receipt_number } = req.params;
  const { account } = req.authData;
  let getSale = await Sales.findOne({ $and: [{ refund_for: receipt_number }, { account: account }] });
  if (getSale) {
    res.status(200).send({ refund: true })
  } else {
    res.status(200).send({ refund: false })
  }
})

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
    const { _id, account, platform } = req.authData;

    let getSale = await Sales.findOne({ $and: [{ receipt_number: receipt_number }, { account: account }, { "store._id": storeId }] });
    if (getSale) {
      const store = await Store.findOne({ account: account, _id: storeId })
      let stockNotification = {
        store: store,
        itemsList: []
      }
      for (const item of getSale.items) {

        if (item.trackStock) {

          var storeItem = await ItemList.findOne({
            _id: item.id,
            stores: { $elemMatch: { store: storeId } },
            account: account,
          }).select([
            "stockQty",
            "stores.price",
            "stores.inStock",
            "stores.lowStock",
          ]);

          if (storeItem) {
            let storeQty = parseInt(storeItem.stores[0].inStock);
            let itemQty = parseInt(storeItem.stockQty);
            if (getSale.receipt_type == "REFUND") {
              storeQty = parseInt(storeItem.stores[0].inStock) - parseInt(item.quantity)
              itemQty = parseInt(storeItem.stockQty) - parseInt(item.quantity)
            } else {
              storeQty = parseInt(storeItem.stores[0].inStock) + parseInt(item.quantity)
              itemQty = parseInt(storeItem.stockQty) + parseInt(item.quantity)
            }

            await ItemList.updateOne(
              { $and: [{ _id: item.id }, { "stores.store": storeId }] },
              {
                $set: {
                  "stockQty": itemQty,
                  "stores.$.inStock": storeQty
                }
              });
            stockNotification.itemsList.push({
              _id: item.id,
              name: item.name,
              storeQty: storeQty,
              itemQty: itemQty
            })
          }
        }
      }
      try {
        let cancelledSale = await Sales.findOneAndUpdate({ _id: getSale._id }, { cancelled_at: cancelled_at, cancelled_by: _id }, {
          new: true,
          upsert: true, // Make this update into an upsert
        });
        req.io.to(account).emit(ITEM_STOCK_UPDATE, { app: stockNotification, backoffice: stockNotification, user: _id, account: account });
        req.io.to(account).emit(RECEIPT_CANCELED, { app: cancelledSale, backoffice: cancelledSale, user: _id, account: account });

        res.status(200).json(cancelledSale);

      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(404).json({ message: "No Data Found!" });
    }
  }
});


module.exports = router;
