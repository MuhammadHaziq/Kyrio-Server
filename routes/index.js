import usersRouter from "../controllers/users";
import itemsRouter from "../controllers/items/items";
import storesRouter from "../controllers/stores";
import devicesRouter from "../controllers/pos_devices"
import taxesRouter from "../controllers/taxes"
import diningRoute from '../controllers/settings/diningOption'
import express from "express";
import { verifyToken } from "../libs/middlewares";
var router = express.Router();

router.get("/", (req, res, next) => {
  res.render("index", { title: "Kyrio POS Server" });
});
router.use("/users", usersRouter);
router.use("/items", verifyToken, itemsRouter);
router.use("/stores", verifyToken, storesRouter)
router.use("/devices", verifyToken, devicesRouter)
router.use("/taxes", verifyToken, taxesRouter)
router.use("/dining", verifyToken, diningRoute)

module.exports = router;
