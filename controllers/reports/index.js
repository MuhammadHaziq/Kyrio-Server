import saleRouter from "./sales";
import express from "express";
var router = express.Router();

router.use("/sale/", saleRouter);

module.exports = router;