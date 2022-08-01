import express from "express";
import Accounts from "../../modals/accounts";
import Users from "../../modals/users";
import Receipt from "../../modals/settings/receipt";
import Sales from "../../modals/sales/sales";
import Store from "../../modals/Store";
import { pagination } from "../../libs/middlewares";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let storeId = "";
    let res1 = "";
    let totalSales = 0,
      totalStore = 0,
      totalReceipt = 0,
      totalSoldItems = 0,
      totalDiscounts = 0,
      totalSaleAmount = 0,
      totalRefundAmount = 0;
    let data = [];
    if (req.query.storeId == 0) {
      totalStore = await Store.find({}).countDocuments();
      totalSales = await Sales.find().countDocuments();
      totalReceipt = await Receipt.find().countDocuments();
      totalSoldItems = await Sales.aggregate([
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$items.id",
            Count: {
              $sum: 1,
            },
          },
        },
      ]);
      res1 = await Sales.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$total_discount" },
            totalSaleAmount: { $sum: "$total_price" },
            totalRefundAmount: { $sum: "$refund_amount" },
          },
        },
      ]);
    } else {
      // with store id data
      storeId = req.query.storeId;
      totalStore = await Store.find({}).countDocuments();
      totalSales = await Sales.find().countDocuments();
      totalReceipt = await Receipt.find({ store: storeId }).countDocuments();
      totalSoldItems = await Sales.aggregate([
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$items.id",
            Count: {
              $sum: 1,
            },
          },
        },
      ]);
      res1 = await Sales.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$total_discount" },
            totalSaleAmount: { $sum: "$total_price" },
            totalRefundAmount: { $sum: "$refund_amount" },
          },
        },
      ]);
    }

    totalDiscounts = res1[0].total;
    totalSaleAmount = res1[0].totalSaleAmount;
    totalRefundAmount = res1[0].totalRefundAmount;
    totalSoldItems = totalSoldItems.length;
    data.push({
      totalSales: totalSales,
      totalStore: totalStore,
      totalReceipt: totalReceipt,
      totalSoldItems: totalSoldItems,
      totalDiscounts: totalDiscounts,
      totalSaleAmount: totalSaleAmount,
      totalRefundAmount: totalRefundAmount,
    });
    // console.log(data);
    if (data) {
      res.status(200).json(data[0]);
    } else if (status === "error") {
      res.status(500).json({ message: "nothing found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/stores", async (req, res) => {
  try {
    const result = await Store.find();
    console.log(result);

    res.status(200).json({ data: result });

    // res.status(500).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

module.exports = router;
