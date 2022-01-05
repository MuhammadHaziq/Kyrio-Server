import express from "express";
import printerModal from "./modal";
import printers from "./printers";

var router = express.Router();

router.use("/modal", printerModal);
router.use("/", printers);

module.exports = router;