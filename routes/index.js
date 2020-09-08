import usersRouter from "../controllers/users";
import itemsRouter from "../controllers/items/items";
import storesRouter from "../controllers/stores";
import devicesRouter from "../controllers/pos_devices";
import taxesRouter from "../controllers/taxes";
import diningRoute from "../controllers/settings/diningOption";
import taxesType from "../controllers/settings/taxes/taxesType";
import taxesOption from "../controllers/settings/taxes/taxesOption";
import itemTax from "../controllers/settings/taxes/itemTax";
import ticketsRouter from "../controllers/tickets/tickets";
import express from "express";
import { verifyToken } from "../libs/middlewares";
var router = express.Router();

router.get("/", (req, res, next) => {
  res.render("index", { title: "Kyrio POS Server" });
});
router.use("/users", usersRouter);
router.use("/tickets", verifyToken, ticketsRouter);
router.use("/items", verifyToken, itemsRouter);
router.use("/stores", verifyToken, storesRouter);
router.use("/devices", verifyToken, devicesRouter);
router.use("/taxes", verifyToken, taxesRouter);
router.use("/dining", verifyToken, diningRoute);
router.use("/tax/taxesType", verifyToken, taxesType);
router.use("/tax/taxesOption", verifyToken, taxesOption);
router.use("/tax", verifyToken, itemTax);
module.exports = router;
