import adminAccountRouter from "./accounts";

import express from "express";
var router = express.Router();

// Admin Routes
router.use("/account", adminAccountRouter);
// #END#
module.exports = router;
