import accountRouter from "../controllers/account";
import usersRouter from "../controllers/users";
import itemsRouter from "../controllers/items/items";
import storesRouter from "../controllers/stores";
import devicesRouter from "../controllers/pos_devices";
import pagesRouter from "../controllers/pages/pages";
import diningRoute from "../controllers/settings/diningOption";
import diningRoute2 from "../controllers/settings/diningOption2";
import taxesType from "../controllers/settings/taxes/taxesType";
import taxesOption from "../controllers/settings/taxes/taxesOption";
import paymentMethods from "../controllers/settings/paymentTypes/paymentMethods.js";
import paymentsType from "../controllers/settings/paymentTypes/paymentsType.js";

import itemTax from "../controllers/settings/taxes/itemTax";
import ticketsRouter from "../controllers/sales/tickets";
import salesRouter from "../controllers/sales/sales";
import reportsRouter from "../controllers/reports/index";
import customersRouter from "../controllers/customers/customers";
import employeeListRouter from "../controllers/employee/employeeList";
import shiftsRouter from "../controllers/employee/shifts";
import userLevelAccessRoutes from "../controllers/employee/userLevelAccess";
import timeCardRoutes from "../controllers/employee/timeCard";
import rolesRoutes from "../controllers/employee/roles";
// #START# Printer Routes
import kitchenPrinter from "../controllers/settings/kitchenPrinter";
import printerModal from "../controllers/printers";
// #END#
import Loyalty from "../controllers/settings/loyalty";
import features from "../controllers/settings/features/features";
import receipts from "../controllers/settings/receipt";
import express from "express";
import { verifyToken } from "../libs/middlewares";
var router = express.Router();

router.get("/", (req, res, next) => {
  res.render("index", { title: "Kyrio POS Server Version 2" });
});
router.use("/users", usersRouter);
router.use("/ownercab", verifyToken, accountRouter);
router.use("/tickets", verifyToken, ticketsRouter);
router.use("/sales", verifyToken, salesRouter);
router.use("/reports", verifyToken, reportsRouter);
router.use("/customers", verifyToken, customersRouter);
router.use("/employee/employeeList", verifyToken, employeeListRouter);
router.use("/employee/shifts", verifyToken, shiftsRouter);
router.use("/employee/userAccess", verifyToken, userLevelAccessRoutes);
router.use("/employee/timecard", verifyToken, timeCardRoutes);
router.use("/roles", verifyToken, rolesRoutes);
router.use("/items", verifyToken, itemsRouter);
router.use("/stores", verifyToken, storesRouter);
router.use("/devices", verifyToken, devicesRouter);
router.use("/pages", verifyToken, pagesRouter);
router.use("/dining", verifyToken, diningRoute);
router.use("/dining2", verifyToken, diningRoute2);
router.use("/tax/taxesType", verifyToken, taxesType);
router.use("/tax/taxesOption", verifyToken, taxesOption);
router.use("/tax", verifyToken, itemTax);
// #START# Printer Routes
router.use("/kitchenPrinter", verifyToken, kitchenPrinter);
router.use("/printer", verifyToken, printerModal);
// #END#
router.use("/paymentTypes", verifyToken, paymentMethods);
router.use("/paymentsType", verifyToken, paymentsType);
router.use("/loyalty", verifyToken, Loyalty);
router.use("/features", verifyToken, features);
router.use("/receipt", verifyToken, receipts);
module.exports = router;
