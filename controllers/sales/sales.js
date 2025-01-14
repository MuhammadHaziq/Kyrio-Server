import express from "express";
import Sales from "../../modals/sales/sales";
import ItemList from "../../modals/items/ItemList";
import Store from "../../modals/Store";
import Customers from "../../modals/customers/customers";
import Loyalties from "../../modals/settings/loyalty";
import {
  REFUND_RECEIPT,
  ITEM_STOCK_UPDATE,
  RECEIPT_CANCELED,
  CUSTOMER_POINTS,
  OPEN_TICKET,
  OPEN_TICKET_DELETE,
} from "../../sockets/events";
import validator from "email-validator";
import { sendReceiptEmail } from "../../libs/sendEmail";
import POS_Device from "../../modals/POS_Device";
import { paginate } from "../../libs/middlewares";
var ObjectId = require("mongoose").Types.ObjectId;
var mongoose = require("mongoose");
const router = express.Router();

router.get("/send", async (req, res) => {
  try {
    const { receipt_id, email } = req.query;

    if (validator.validate(email)) {
      let result = await Sales.findOne({ _id: receipt_id });
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
    const { update_at, store_id } = req.query;
    let filter = {
      account: account,
      cancelled_at: null,
      "store._id": store_id,
    };

    let isoDate = new Date(update_at);

    if (platform === "pos") {
      filter.updated_at = { $gte: isoDate };
    }
    var allSales = await Sales.find(filter).sort({ _id: "desc" });
    res.status(200).json(allSales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/receipts", async (req, res) => {
  try {
    const { account, platform } = req.authData;
    const { update_at, store_id } = req.query;
    let filter = {
      account: account,
      cancelled_at: null,
      "store._id": store_id,
    };
    let isoDate = new Date(update_at);

    if (platform === "pos") {
      filter.updated_at = { $gte: isoDate };
    }
    const response = await paginate(Sales, req, filter)
    if(response.status === "ok"){
      res.status(200).json(response.result);
    } else if(response.status === "error"){
      res.status(500).json({ message: response.message });
    }
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
      searchResult = await Sales.find({
        $or: [{ ticket_name: ticket }, { _id: sale_id }],
        account: account,
      }).sort({ _id: "desc" });
    } else {
      searchResult = await Sales.find({
        $or: [{ ticket_name: ticket }],
        account: account,
      }).sort({ _id: "desc" });
    }

    res.status(200).json(searchResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    const { _id, account } = req.authData;
    let oldTicket = await Sales.findOne({ _id: id });
    if (oldTicket) {
      if (ObjectId.isValid(id)) {
        await Sales.deleteOne({ _id: id });
        req.io.to(account).emit(OPEN_TICKET_DELETE, {
          app: { ticket_id: id },
          backoffice: { ticket_id: id },
          user: _id,
          account: account,
        });
        res.status(200).json({ message: "ok", result: { ticket_id: id } });
      } else {
        res.status(400).json({ message: "Invalid Object ID", result: {} });
      }
    } else {
      res.status(400).json({ message: "Ticket Not Found", result: {} });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  var {
    sale_id,
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
    created_at,
    payments,
    send_email,
  } = req.body;

  if (sale_timestamp !== "" && sale_timestamp !== null) {
    sale_timestamp = sale_timestamp;
  } else {
    sale_timestamp = Date.now();
  }
  var errors = [];
  if (!open) {
    if (!payments || typeof payments == "undefined" || payments.length === 0) {
      errors.push({ receipt_type: `Please Enter Payments!` });
    }
  }
  if (
    !receipt_type ||
    typeof receipt_type == "undefined" ||
    receipt_type == ""
  ) {
    errors.push({ receipt_type: `Invalid Receipt Type!` });
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
    const { _id, account, decimal } = req.authData;
    
    const ifAlreadyExist = await Sales.findOne({ account: account, "store._id": store._id, receipt_number: receipt_number })
    if(ifAlreadyExist){
      res.status(200).json(ifAlreadyExist);
    } else {
      
    let stockNotification = {
      store,
      itemsList: [],
    };
    if (!open) {
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
            let storeQty =
              typeof storeItem.stores !== "undefined"
                ? parseInt(storeItem.stores[0].inStock) -
                  parseInt(item.quantity)
                : parseInt(item.quantity);
            let itemQty =
              parseInt(storeItem.stockQty) - parseInt(item.quantity);
            await ItemList.updateOne(
              { $and: [{ _id: item.id }, { "stores.store": store._id }] },
              {
                $set: {
                  stockQty: itemQty,
                  "stores.$.inStock": storeQty,
                },
              }
            );
            stockNotification.itemsList.push({
              _id: item.id,
              name: item.name,
              storeQty: storeQty,
              itemQty: itemQty,
            });
          }
        }
      }
    }

    try {
      let orderNo = parseInt(order_number.split("-")[2]);
      // customer from receipt

      let addCustomer = {
        ...customer,
        points_earned: 0,
        points_balance: 0,
      };
      if (customer) {
        try {
          const loyalty = await Loyalties.findOne({
            account: account,
          });
          let findCustomer = await Customers.findOne({ _id: customer._id });
          if (loyalty && findCustomer) {
            let earnedPoints = Math.round((loyalty.amount / 100) * total_price);
            let totalPointsBalance = parseInt(findCustomer.points_balance);
            totalPointsBalance =
              parseInt(totalPointsBalance) + parseInt(earnedPoints);

            let first_visit = findCustomer.first_visit
              ? findCustomer.first_visit
              : new Date();
            let last_visit = new Date();

            let total_visits = findCustomer.total_visits
              ? findCustomer.total_visits + 1
              : 1;

            let total_spent = findCustomer.total_spent
              ? findCustomer.total_spent + total_price
              : total_price;

            let total_points = totalPointsBalance;

            await Customers.findOneAndUpdate(
              { _id: findCustomer._id },
              {
                $set: {
                  points_balance: total_points,
                  first_visit: first_visit,
                  last_visit: last_visit,
                  total_visits: total_visits,
                  total_spent: total_spent,
                  total_points: total_points,
                },
              },
              {
                new: true,
                upsert: true, // Make this update into an upsert
              }
            );
            addCustomer.points_earned = earnedPoints;
            addCustomer.points_balance = totalPointsBalance;
          }
        } catch (e) {
          console.log(e.message);
        }
      }
      let saleData = {
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
        customer: customer ? addCustomer : null,
        dining_option,
        store,
        payment_method,
        cashier,
        device,
        created_by: _id,
        user: _id,
        created_at: sale_timestamp !== null ? sale_timestamp : created_at,
        updated_at: sale_timestamp !== null ? sale_timestamp : created_at,
        payments: payments,
        send_email: send_email ? send_email : null,
      };
      var newSales = {};
      if (ObjectId.isValid(sale_id)) {
        newSales = await Sales.findOneAndUpdate(
          { _id: sale_id },
          {
            $set: saleData,
          },
          {
            new: true,
            upsert: true, // Make this update into an upsert
          }
        );
      } else {
        newSales = await new Sales(saleData).save();
      }

      if (!open) {
        let noOfSales = parseInt(receipt_number.split("-")[1]);

        await POS_Device.updateOne(
          { _id: device._id },
          {
            $set: {
              noOfSales: noOfSales,
              order_number: orderNo,
            },
          }
        );
      }
      if (!open) {
        req.io.to(account).emit(ITEM_STOCK_UPDATE, {
          app: stockNotification,
          backoffice: stockNotification,
          user: _id,
          account: account,
        });
        if (customer) {
          req.io.to(account).emit(CUSTOMER_POINTS, {
            app: addCustomer,
            backoffice: addCustomer,
            user: _id,
            account: account,
          });
        }
      }

      if (open) {
        req.io.to(account).emit(OPEN_TICKET, {
          app: newSales,
          backoffice: newSales,
          user: _id,
          account: account,
        });
      } else if (!open && ObjectId.isValid(sale_id)) {
        req.io.to(account).emit(OPEN_TICKET_DELETE, {
          app: { ticket_id: sale_id },
          backoffice: { ticket_id: sale_id },
          user: _id,
          account: account,
        });
      }

      res.status(200).json(newSales);
      if (!open) {
        if (send_email !== "" && send_email !== null) {
          try {
            const mailSent = await sendReceiptEmail(
              send_email,
              newSales,
              store.name,
              decimal,
              {},
              "full"
            );
            await Sales.findOneAndUpdate(
              { receipt_number: newSales.receipt_number },
              { send_email_check: true }
            );
          } catch (error) {
            console.error(error, "email Send Error");
          }
        }
      }
      // if (stockNotification.length > 0) {
      //   console.log(stockNotification);
      // }
      if (!open) {
        if (payments.length > 0) {
          payments.map(async (pay) => {
            if (pay.email !== "") {
              const mailSent = await sendReceiptEmail(
                pay.email,
                newSales,
                store.name,
                decimal,
                pay,
                "split"
              );
            }
          });
        }
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
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
    created_at,
  } = req.body;

  var errors = [];
  if (!refund_for || typeof refund_for == "undefined" || refund_for == "") {
    errors.push({ refund_for: `Invalid Refund For!` });
  }
  if (
    !receipt_number ||
    typeof receipt_number == "undefined" ||
    receipt_number == ""
  ) {
    errors.push({ receipt_number: `Invalid Receipt No!` });
  }
  if (
    !receipt_type ||
    typeof receipt_type == "undefined" ||
    receipt_type == ""
  ) {
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

    let getSale = await Sales.findOne({
      $and: [{ receipt_number: refund_for }, { account: account }],
    });
    if (getSale) {
      let stockNotification = {
        store,
        itemsList: [],
      };
      for (const item of items) {
        await Sales.updateOne(
          { $and: [{ _id: getSale._id }, { "items.id": item.id }] },
          {
            $set: {
              "items.$.refund_quantity": item.quantity,
              updated_at: created_at,
            },
          }
        );
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
            let storeQty =
              parseInt(storeItem.stores[0].inStock) + parseInt(item.quantity);
            let itemQty =
              parseInt(storeItem.stockQty) + parseInt(item.quantity);
            await ItemList.updateOne(
              { $and: [{ _id: item.id }, { "stores.store": store._id }] },
              {
                $set: {
                  stockQty: itemQty,
                  "stores.$.inStock": storeQty,
                },
              }
            );
            stockNotification.itemsList.push({
              _id: item.id,
              name: item.name,
              storeQty: storeQty,
              itemQty: itemQty,
            });
          }
        }
      }
      try {
        // customer from receipt
        let addCustomer = {
          ...customer,
          points_earned: 0,
          points_balance: 0,
        };
        if (customer) {
          try {
            const loyalty = await Loyalties.findOne({
              account: account,
            });
            let findCustomer = await Customers.findOne({ _id: customer._id });
            if (loyalty && findCustomer) {
              let earnedPoints = Math.round(
                (loyalty.amount / 100) * total_price
              );
              let totalPointsBalance = parseInt(findCustomer.points_balance);
              totalPointsBalance =
                parseInt(totalPointsBalance) - parseInt(earnedPoints);

              let first_visit = findCustomer.first_visit
                ? findCustomer.first_visit
                : new Date();
              let last_visit = new Date();

              let total_visits = findCustomer.total_visits
                ? findCustomer.total_visits + 1
                : 1;

              let total_spent = findCustomer.total_spent
                ? findCustomer.total_spent - total_price
                : total_price;

              let total_points = totalPointsBalance;

              await Customers.findOneAndUpdate(
                { _id: findCustomer._id },
                {
                  $set: {
                    points_balance: total_points,
                    first_visit: first_visit,
                    last_visit: last_visit,
                    total_visits: total_visits,
                    total_spent: total_spent,
                    total_points: total_points,
                  },
                },
                {
                  new: true,
                  upsert: true, // Make this update into an upsert
                }
              );
              addCustomer.points_earned = earnedPoints;
              addCustomer.points_balance = totalPointsBalance;
            }
          } catch (e) {
            console.log(e.message);
          }
        }

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
          customer: addCustomer,
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
              noOfSales: noOfSales,
            },
          }
        );

        let refundedSale = await Sales.findOne({
          $and: [{ _id: getSale._id }, { account: account }],
        });
        req.io.to(account).emit(ITEM_STOCK_UPDATE, {
          app: stockNotification,
          backoffice: stockNotification,
          user: _id,
          account: account,
        });
        if (customer) {
          req.io.to(account).emit(CUSTOMER_POINTS, {
            app: addCustomer,
            backoffice: addCustomer,
            user: _id,
            account: account,
          });
        }
        req.io.to(account).emit(REFUND_RECEIPT, {
          app: { refundReceipt: newRefund, saleReceipt: refundedSale },
          backoffice: {},
          user: _id,
          account: account,
        });
        res.status(200).json(newRefund);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(400).json({ message: "No Sale Data Found! Invalid Refund" });
    }
  }
});

router.get("/check/:sale_id", async (req, res) => {
  const { sale_id } = req.params;
  const { account } = req.authData;
  let filter = { account: account }
  let getCurrentSale = await Sales.findOne({
    $and: [{ _id: sale_id }, filter],
  });
  if(getCurrentSale){
    let getRefundedSale = await Sales.findOne({
      $and: [{ refund_for: getCurrentSale.receipt_number }, { "store._id": {$eq: getCurrentSale.store._id } }],
    });
    if (getRefundedSale) {
      res.status(200).send({ refund: true });
    } else {
      res.status(200).send({ refund: false });
    }
  } else {
    res.status(200).send({ refund: false });
  }
});

router.patch("/cancel", async (req, res) => {
  const { receipt_number, storeId, cancelled_at } = req.body;

  var errors = [];
  if (
    !receipt_number ||
    typeof receipt_number == "undefined" ||
    receipt_number == ""
  ) {
    errors.push({ receipt_number: `Invalid Receipt No!` });
  }
  if (
    !cancelled_at ||
    typeof cancelled_at == "undefined" ||
    cancelled_at == ""
  ) {
    errors.push({ cancelled_at: `Invalid Cancelled At!` });
  }
  if (typeof storeId == "undefined" || storeId == "") {
    errors.push({ storeId: `Invalid store ID!` });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id, account, platform } = req.authData;

    let getSale = await Sales.findOne({
      $and: [
        { receipt_number: receipt_number },
        { account: account },
        { "store._id": storeId },
      ],
    });
    if (getSale) {
      const store = await Store.findOne({ account: account, _id: storeId });
      let stockNotification = {
        store: store,
        itemsList: [],
      };
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
              storeQty =
                parseInt(storeItem.stores[0].inStock) - parseInt(item.quantity);
              itemQty = parseInt(storeItem.stockQty) - parseInt(item.quantity);
            } else {
              storeQty =
                parseInt(storeItem.stores[0].inStock) + parseInt(item.quantity);
              itemQty = parseInt(storeItem.stockQty) + parseInt(item.quantity);
            }

            await ItemList.updateOne(
              { $and: [{ _id: item.id }, { "stores.store": storeId }] },
              {
                $set: {
                  stockQty: itemQty,
                  "stores.$.inStock": storeQty,
                },
              }
            );
            stockNotification.itemsList.push({
              _id: item.id,
              name: item.name,
              storeQty: storeQty,
              itemQty: itemQty,
            });
          }
        }
      }
      try {
        let cancelledSale = await Sales.findOneAndUpdate(
          { _id: getSale._id },
          { cancelled_at: cancelled_at, cancelled_by: _id },
          {
            new: true,
            upsert: true, // Make this update into an upsert
          }
        )
          .populate("user", "name")
          .sort({ receipt_number: "desc" });
        req.io.to(account).emit(ITEM_STOCK_UPDATE, {
          app: stockNotification,
          backoffice: stockNotification,
          user: _id,
          account: account,
        });
        req.io.to(account).emit(RECEIPT_CANCELED, {
          app: cancelledSale,
          backoffice: cancelledSale,
          user: _id,
          account: account,
        });

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
