import adminAccountRouter from "./accounts";
import adminStoresRouter from "./stores";
import adminDashboardRouter from "./dashboard";

import express from "express";
var router = express.Router();

// Admin Routes
router.use("/account", adminAccountRouter);
router.use("/stores", adminStoresRouter);
router.use("/dashboard", adminDashboardRouter);
// #END#
module.exports = router;
