import express from "express";
import path from "path";
import Accounts from "../modals/accounts";
import Users from "../modals/users";
import Category from "../modals/items/category";
import Discount from "../modals/items/Discount";
import Modifier from "../modals/items/Modifier";
import ItemList from "../modals/items/ItemList";
import KitchenPrinter from "../modals/settings/kitchenPrinter";
import PaymentMethods from "../modals/settings/paymentTypes/paymentMethods";
import DiningOption from "../modals/settings/diningOption";
import PaymentsType from "../modals/settings/paymentTypes/paymentsType";
import POS_Device from "../modals/POS_Device";
import Role from "../modals/role";
import ItemTax from "../modals/settings/taxes/itemTax";
import Loyalty from "../modals/settings/loyalty";
import Receipts from "../modals/settings/receipt";
import Tickets from "../modals/sales/tickets";
import Sales from "../modals/sales/sales";
import Customers from "../modals/customers/customers";
import Store from "../modals/Store";
import SkuHistory from "../modals/items/SKUHistory";
import DeletedAccounts from "../modals/DeletedAccounts";
import md5 from "md5";
const router = express.Router();
var rimraf = require("rimraf");

router.get("/getAccountInfo", async (req, res) => {
  try {
    const { _id, account } = req.authData;
    const accountInfo = await Accounts.findOne({ _id: account }).select([
      "businessName",
      "decimal",
    ]);
    const userInfo = await Users.findOne({ _id: _id, account: account }).select(
      ["_id", "owner_id", "email", "timezone", "language"]
    );
    const result = {
      businessName: accountInfo.businessName,
      decimal: accountInfo.decimal,
      email: userInfo.email,
      timezone: userInfo.timezone,
      language: userInfo.language,
      is_owner: String(userInfo._id) === String(userInfo.owner_id),
    };
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/checkPassword", async (req, res) => {
  try {
    const { password } = req.body;
    const { _id, account } = req.authData;
    const result = await Users.findOne({
      _id: _id,
      account: account,
      password: md5(password),
    });
    if (result) {
      res.status(200).json({ passwordCorrect: "YES" });
    } else {
      res
        .status(200)
        .json({ passwordCorrect: "NO", message: "Wrong password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/changeOwnerEmail", async (req, res) => {
  try {
    const { email } = req.body;
    const { _id, account } = req.authData;
    const result = await Users.updateOne(
      { _id: _id, account: account },
      { email: email }
    );
    if (result) {
      res.status(200).json({ status: true, email: email });
    } else {
      res.status(200).json({ status: false, email: "" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/changeOwnerPassword", async (req, res) => {
  try {
    const { password } = req.body;
    const { _id, account } = req.authData;
    const result = await Users.updateOne(
      { _id: _id, account: account },
      { password: md5(password) }
    );
    if (result) {
      res.status(200).json({ status: true });
    } else {
      res.status(200).json({ status: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/setAccountInfo", async (req, res) => {
  try {
    const { businessName, timezone, language } = req.body;
    const { is_owner, _id, account } = req.authData;

    if (is_owner) {
      await Accounts.updateOne(
        { _id: account },
        {
          businessName: businessName,
        }
      );
    }
    const result = await Users.updateOne(
      { _id: _id, account: account },
      { timezone: timezone, language: language }
    );
    if (result) {
      let data = {
        status: true,
        businessName,
        timezone,
        language,
      };
      res.status(200).json(data);
    } else {
      res.status(200).json({ status: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/deleteAccount", async (req, res) => {
  try {
    const { reason, comments, confirm } = req.body;
    const { email, businessName, is_owner, account } = req.authData;

    if (is_owner) {
      const DeleteAcc = new DeletedAccounts({
        email: email,
        businessName: businessName,
        reason: reason,
        comments: comments,
        confirm: confirm,
      });
      const result = await DeleteAcc.save();
      if (result) {
        await Accounts.deleteOne({ _id: account });
        await Category.deleteMany({ account: account });
        await Discount.deleteMany({ account: account });
        await Modifier.deleteMany({ account: account });
        await ItemList.deleteMany({ account: account });
        await DiningOption.deleteMany({ account: account });
        await KitchenPrinter.deleteMany({ account: account });
        await PaymentMethods.deleteMany({ account: account });
        await PaymentsType.deleteMany({ account: account });
        await POS_Device.deleteMany({ account: account });
        await Role.deleteMany({ account: account });
        await ItemTax.deleteMany({ account: account });
        await Users.deleteMany({ account: account });
        await Loyalty.deleteMany({ account: account });
        await Receipts.deleteMany({ account: account });
        await Tickets.deleteMany({ account: account });
        await Sales.deleteMany({ account: account });
        await Customers.deleteMany({ account: account });
        await SkuHistory.deleteMany({ account: account });
        await Store.deleteMany({ account: account });
        rimraf(path.join(__dirname, "../uploads/items/" + account), () => {
          console.log("Items Images Deleted");
        });
        rimraf(path.join(__dirname, "../uploads/receipt/" + account), () => {
          console.log("Receipt Images Deleted");
        });
        rimraf(path.join(__dirname, "../uploads/csv/" + account), () => {
          console.log("CSV Files Deleted");
        });
        res.status(200).json({ status: true });
      }
    } else {
      res.status(200).json({ status: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
