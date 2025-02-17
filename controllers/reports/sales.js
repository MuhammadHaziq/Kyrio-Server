import express from "express";
import dateformat from "dateformat";
import _, { groupBy, orderBy, slice, isEmpty, sumBy } from "lodash";
import Sales from "../../modals/sales/sales";
import ItemList from "../../modals/items/ItemList";
import Users from "../../modals/users";
import Shifts from "../../modals/employee/shifts";
import Modifier from "../../modals/items/Modifier";
import NewReports from "./newReports";
import {
  truncateDecimals,
  filterSales,
  filterItemSales,
} from "../../function/globals";
import { pagination } from "../../libs/middlewares";
const moment = require("moment");
const router = express.Router();

router.get("/summary-test", async (req, res) => {
  try {
    // const { startDate, endDate, stores, employees, divider, matches } =
    //   req.body;
    const { account, decimal } = req.authData;
    // var start = dateformat(startDate, "yyyy-mm-dd");
    // var end = dateformat(endDate, "yyyy-mm-dd");
    var start = "2022-08-04 00:00:00";
    var end = "2022-08-04 23:59:59";
    var employees = [
      "62d99026962a171c6829f2dc",
      "628aeeb5dfb45b23782a7700",
      "628b6ea9dfb45b23782a791a",
    ];
    var stores = ["628aeeb5dfb45b23782a7716"];

    var sales = await Sales.aggregate([
      {
        $match: {
          created_at: { $gte: new Date(start), $lte: new Date(end) },
          account: account,
          open: false,
          cancelled_at: null,
          "store._id": { $in: stores },
          "cashier._id": { $in: employees },
        },
      },
    ]);
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.use("/", NewReports);
router.post("/summary", async (req, res) => {
  try {
    
    const { startDate, endDate, stores, employees, divider, matches } =
      req.body;

    const { account, decimal } = req.authData;
    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    var sales = await Sales.find({
      $and: [
        { created_at: { $gte: start, $lte: end } },
        { account: account },
        { open: false },
        { cancelled_at: null },
        { "store._id": { $in: stores } },
        { created_by: { $in: employees } },
      ],
    });
    
    let report = await filterSales(sales, divider, matches, decimal);

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/item", async (req, res) => {
  try {
    const { startDate, endDate, stores, employees, divider, matches } =
      req.body;
    const { account, decimal } = req.authData;

    // var start = moment(startDate, "YYYY-MM-DD  HH:mm:ss");
    // var end = moment(endDate, "YYYY-MM-DD  HH:mm:ss").add(1, "days");
    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    var sales = await Sales.find({
      $and: [
        { created_at: { $gte: start, $lte: end } },
        { account: account },
        { open: false },
        { cancelled_at: null },
        { "store._id": { $in: stores } },
        { created_by: { $in: employees } },
      ],
    });

    let items = [];
    await sales.map((itm) =>
      itm.items.map((item) => {
        items.push(item.id);
      })
    );
    items = await groupBy(items);

    let reportData = [];
    let itemKeys = Object.keys(items);

    let itemsFound = await ItemList.find({
      $and: [{ account: account }, { _id: { $in: itemKeys } }],
    }).populate("category", ["_id", "title"]);

    for (var item of itemsFound) {
      let TotalGrossSales = 0;
      let TotalRefunds = 0;
      let TotalDiscounts = 0;
      let TotalNetSale = 0;
      let CostOfGoods = 0;
      let TotalGrossProfit = 0;
      let TotalItemsSold = 0;
      let TotalItemsRefunded = 0;
      let TotalMargin = 0;
      let TotalTax = 0;
      let SaleTotalTax = 0;

      TotalItemsSold = 0;
      TotalItemsRefunded = 0;
      for (const sale of sales) {
        let found = sale.items.filter((itm) => itm.id == item._id);
        if (found.length > 0) {
          if (sale.receipt_type == "SALE") {
            TotalNetSale += sumBy(found, "total_price");
            TotalDiscounts += sumBy(found, "total_discount");
            CostOfGoods += sumBy(found, "cost");
            TotalGrossSales += sumBy(found, "total_price");
            TotalItemsSold +=
              sumBy(found, "quantity") - sumBy(found, "refund_quantity");
            TotalTax +=
              sumBy(found, "total_tax") + sumBy(found, "total_tax_included");
            SaleTotalTax += sumBy(found, "total_tax");
          } else if (sale.receipt_type == "REFUND") {
            TotalRefunds += sumBy(found, "total_price");
            TotalDiscounts = TotalDiscounts - sumBy(found, "total_discount");
            CostOfGoods = CostOfGoods - sumBy(found, "cost");
            TotalItemsRefunded += sumBy(found, "quantity");
            TotalTax =
              TotalTax -
              (sumBy(found, "total_tax") + sumBy(found, "total_tax_included"));
            SaleTotalTax = SaleTotalTax - sumBy(found, "total_tax");
          }
        }
      }

      TotalNetSale = TotalGrossSales - TotalDiscounts - TotalRefunds;
      TotalGrossProfit = TotalNetSale - CostOfGoods;
      TotalMargin = (
        ((decimal, TotalNetSale - CostOfGoods) / TotalNetSale) *
        100
      ).toFixed(2);

      let SalesTotal = {
        GrossSales: truncateDecimals(decimal, TotalGrossSales, 2),
        Refunds: truncateDecimals(decimal, TotalRefunds),
        discounts: truncateDecimals(decimal, TotalDiscounts),
        NetSales: truncateDecimals(decimal, TotalNetSale),
        CostOfGoods: truncateDecimals(decimal, CostOfGoods),
        GrossProfit: truncateDecimals(decimal, TotalGrossProfit),
        ItemsSold: TotalItemsSold,
        ItemsRefunded: TotalItemsRefunded,
        Margin: TotalMargin,
        Tax: truncateDecimals(decimal, TotalTax),
        id: item._id,
        name: item.title,
        sku: item.sku,
        color: item.color,
        image: item.image,
        category:
          typeof item.category !== "undefined" &&
          item.category !== null &&
          !isEmpty(item.category)
            ? item.category.title
            : "No category",
      };
      reportData.push(SalesTotal);
    }
    let itemsReport = reportData;

    let topFiveItems = orderBy(reportData, ["NetSales"], ["desc"]); // Use Lodash to sort array by 'NetSales'
    topFiveItems = slice(topFiveItems, [(start = 0)], [(end = 5)]);

    let graphRecord = await filterItemSales(
      sales,
      topFiveItems,
      divider,
      matches,
      decimal
    );

    res.status(200).json({ itemsReport, topFiveItems, graphRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/category", async (req, res) => {
  try {
    const { startDate, endDate, stores, employees } = req.body;
    const { account, decimal } = req.authData;

    // var start = moment(startDate, "YYYY-MM-DD  HH:mm:ss");
    // var end = moment(endDate, "YYYY-MM-DD  HH:mm:ss").add(1, "days");
    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    var sales = await Sales.find({
      $and: [
        { created_at: { $gte: start, $lte: end } },
        { account: account },
        { open: false },
        { cancelled_at: null },
        { "store._id": { $in: stores } },
        { created_by: { $in: employees } },
      ],
    });

    // let items = await groupBy(sales.map(itm => itm.items.map(item => { return item.id})[0]))
    let items = [];
    await sales.map((itm) =>
      itm.items.map((item) => {
        items.push(item.id);
      })
    );
    items = await groupBy(items);

    let reportData = [];
    let itemKeys = Object.keys(items);

    let itemsFound = await ItemList.find({
      $and: [{ account: account }, { _id: { $in: itemKeys } }],
    }).populate("category", ["_id", "title"]);

    let categories = await groupBy(
      itemsFound.map((itm) => {
        return itm.category !== null
          ? typeof itm.category !== "undefined" &&
            typeof itm.category.title !== "undefined"
            ? itm.category.title
            : "No category"
          : "No category";
      })
    );
    let catKeys = Object.keys(categories);

    for (var cat of catKeys) {
      let TotalGrossSales = 0;
      let TotalRefunds = 0;
      let TotalDiscounts = 0;
      let TotalNetSale = 0;
      let CostOfGoods = 0;
      let TotalGrossProfit = 0;
      let TotalItemsSold = 0;
      let TotalItemsRefunded = 0;
      let TotalMargin = 0;
      let TotalTax = 0;
      let SaleTotalTax = 0;
      let SalesTotal = {};

      TotalItemsSold = 0;
      TotalItemsRefunded = 0;

      for (var item of itemsFound) {
        let category =
          item.category !== null
            ? typeof item.category !== "undefined" &&
              typeof item.category.title !== "undefined"
              ? item.category.title
              : "No category"
            : "No category";
        if (cat == category) {
          for (const sale of sales) {
            let found = sale.items.filter((itm) => itm.id == item._id);
            if (found.length > 0) {
              if (sale.receipt_type == "SALE") {
                TotalNetSale += sumBy(found, "total_price");
                TotalDiscounts += sumBy(found, "total_discount");
                CostOfGoods += sumBy(found, "cost");
                TotalGrossSales += sumBy(found, "total_price");
                TotalItemsSold += sumBy(found, "quantity");
                TotalTax +=
                  sumBy(found, "total_tax") +
                  sumBy(found, "total_tax_included");
                SaleTotalTax += sumBy(found, "total_tax");
              } else if (sale.receipt_type == "REFUND") {
                TotalRefunds += sumBy(found, "total_price");
                TotalDiscounts =
                  TotalDiscounts - sumBy(found, "total_discount");
                CostOfGoods = CostOfGoods - sumBy(found, "cost");
                TotalItemsRefunded += sumBy(found, "quantity");
                TotalTax =
                  TotalTax -
                  (sumBy(found, "total_tax") +
                    sumBy(found, "total_tax_included"));
                SaleTotalTax = SaleTotalTax - sumBy(found, "total_tax");
              }
            }
          }
          TotalNetSale = TotalGrossSales - TotalDiscounts - TotalRefunds;
          TotalGrossProfit = TotalNetSale - CostOfGoods;
          TotalMargin = (
            ((TotalNetSale - CostOfGoods) / TotalNetSale) *
            100
          ).toFixed(2);
        }
      }
      SalesTotal = {
        GrossSales: truncateDecimals(decimal, TotalGrossSales),
        Refunds: truncateDecimals(decimal, TotalRefunds),
        discounts: truncateDecimals(decimal, TotalDiscounts),
        NetSales: truncateDecimals(decimal, TotalNetSale),
        CostOfGoods: truncateDecimals(decimal, CostOfGoods),
        GrossProfit: truncateDecimals(decimal, TotalGrossProfit),
        ItemsSold: TotalItemsSold,
        Tax: TotalTax,
        ItemsRefunded: TotalItemsRefunded,
        Margin: TotalMargin,
        category: cat,
      };
      reportData.push(SalesTotal);
    }
    // let itemsReport = await groupBy(reportData.map(itm =>{return itm.category}));

    res.status(200).json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/employee", async (req, res) => {
  try {
    const { startDate, endDate, stores, employees } = req.body;
    const { account, decimal } = req.authData;

    // var start = moment(startDate, "YYYY-MM-DD  HH:mm:ss");
    // var end = moment(endDate, "YYYY-MM-DD  HH:mm:ss").add(1, "days");
    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    let sales = await Sales.aggregate([
      {
        $match: {
          created_at: { $gte: new Date(start), $lte: new Date(end) },
          account: account,
          open: false,
          cancelled_at: null,
          "store._id": { $in: stores },
          "cashier._id": { $in: employees },
        },
      },
      { $group: { _id: "$created_by", sales: { $push: "$$ROOT" } } },
    ]);

    let reportData = [];

    for (var empSale of sales) {
      let emp = await Users.findOne({
        $and: [{ account: account }, { _id: { $in: empSale._id } }],
      }).select("name");

      let TotalGrossSales = 0;
      let TotalRefunds = 0;
      let TotalDiscounts = 0;
      let TotalNetSale = 0;
      let CostOfGoods = 0;
      let TotalGrossProfit = 0;
      let TotalItemsSold = 0;
      let TotalItemsRefunded = 0;
      let TotalMargin = 0;
      let TotalTax = 0;
      let SaleTotalTax = 0;

      TotalItemsSold = 0;
      TotalItemsRefunded = 0;

      for (const sale of empSale.sales) {
        if (sale.receipt_type == "SALE") {
          TotalNetSale += sale.total_price;
          TotalDiscounts += sale.total_discount;
          CostOfGoods += sale.cost_of_goods;
          TotalGrossSales += sale.sub_total;
          TotalTax += sale.total_tax + sale.total_tax_included;
          SaleTotalTax += sale.total_tax;
        } else if (sale.receipt_type == "REFUND") {
          TotalRefunds += sale.total_price;
          TotalDiscounts = TotalDiscounts - sale.total_discount;
          CostOfGoods = CostOfGoods - sale.cost_of_goods;
          TotalTax = TotalTax - (sale.total_tax + sale.total_tax_included);
          SaleTotalTax = SaleTotalTax - sale.total_tax;
          TotalItemsRefunded++;
        }
        TotalItemsSold++;
      }
      TotalNetSale = TotalGrossSales - TotalDiscounts - TotalRefunds;
      TotalGrossProfit = TotalNetSale - CostOfGoods;
      TotalMargin = ((TotalGrossProfit / TotalNetSale) * 100).toFixed(2);

      let SalesTotal = {
        GrossSales: truncateDecimals(decimal, TotalGrossSales),
        Refunds: truncateDecimals(decimal, TotalRefunds),
        discounts: truncateDecimals(decimal, TotalDiscounts),
        NetSales: truncateDecimals(decimal, TotalNetSale),
        CostOfGoods: truncateDecimals(decimal, CostOfGoods),
        GrossProfit: truncateDecimals(decimal, TotalGrossProfit),
        ItemsSold: TotalItemsSold,
        Tax: truncateDecimals(decimal, TotalTax),
        Receipts: empSale.sales.length,
        AverageSale: truncateDecimals(
          decimal,
          TotalNetSale / empSale.sales.length
        ),
        ItemsRefunded: TotalItemsRefunded,
        Margin: truncateDecimals(decimal, TotalMargin),
        Name: emp.name,
      };
      reportData.push(SalesTotal);
    }

    res.status(200).json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/paymentstypes", async (req, res) => {
  try {
    const { startDate, endDate, stores, employees } = req.body;
    const { account, decimal } = req.authData;

    // var start = moment(startDate, "YYYY-MM-DD  HH:mm:ss");
    // var end = moment(endDate, "YYYY-MM-DD  HH:mm:ss").add(1, "days");
    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    var receipts = await Sales.find({
      $and: [
        { created_at: { $gte: start, $lte: end } },
        { account: account },
        { open: false },
        { cancelled_at: null },
        { "store._id": { $in: stores } },
        { created_by: { $in: employees } },
      ],
    }).populate("user", "name");

    let payments = [];
    await receipts.map((itm) => {
      itm.payments.map((item) => {
        payments.push({
          receipt_type: itm.receipt_type,
          amount: item.money_amount,
          payment_type_id: item.payment_type_id,
          type: item.name,
        });
      });
    });
    payments = await groupBy(payments, "payment_type_id");

    let paymentKeys = Object.keys(payments);

    let reportData = [];
    let totalPaymentTransactions = 0,
      totalPaymentAmount = 0,
      totalRefundTransactions = 0,
      totalRefundAmount = 0,
      totalNetAmount = 0;
    for (var payment of paymentKeys) {
      let paymentTransactions = 0;
      let paymentAmount = 0;
      let refundTransactions = 0;
      let refundAmount = 0;
      let netAmount = 0;
      for (const pay of payments[payment]) {
        if (pay.receipt_type == "SALE") {
          paymentAmount += pay.amount;
          paymentTransactions++;
        } else if (pay.receipt_type == "REFUND") {
          refundAmount += pay.amount;
          refundTransactions++;
        }
      }
      netAmount = paymentAmount - refundAmount;

      let SalesTotal = {
        paymentTransactions: truncateDecimals(decimal, paymentTransactions),
        paymentAmount: truncateDecimals(decimal, paymentAmount),
        refundTransactions: truncateDecimals(decimal, refundTransactions),
        refundAmount: truncateDecimals(decimal, refundAmount),
        netAmount: truncateDecimals(decimal, netAmount),
        PaymentType: payments[payment][0].type,
      };
      totalPaymentTransactions += paymentTransactions;
      totalPaymentAmount += paymentAmount;
      totalRefundTransactions += refundTransactions;
      totalRefundAmount += refundAmount;
      totalNetAmount += netAmount;
      reportData.push(SalesTotal);
    }
    let total = {
      totalPaymentTransactions: truncateDecimals(
        decimal,
        totalPaymentTransactions
      ),
      totalPaymentAmount: truncateDecimals(decimal, totalPaymentAmount),
      totalRefundTransactions: truncateDecimals(
        decimal,
        totalRefundTransactions
      ),
      totalRefundAmount: truncateDecimals(decimal, totalRefundAmount),
      totalNetAmount: truncateDecimals(decimal, totalNetAmount),
    };
    res.status(200).json({ report: reportData, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/receipts", async (req, res) => {
  try {
    const { startDate, endDate, stores, employees } = req.body;
    const { account, decimal } = req.authData;

    // var start = moment(startDate, "YYYY-MM-DD  HH:mm:ss");
    // var end = moment(endDate, "YYYY-MM-DD  HH:mm:ss").add(1, "days");
    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    var receipts = await Sales.find({
      $and: [
        { created_at: { $gte: start, $lte: end } },
        { account: account },
        { open: false },
        { "store._id": { $in: stores } },
        { created_by: { $in: employees } },
      ],
    })
      .populate("user", "name")
      .populate("cancelled_by", ["_id", "name"])
      .sort({ receipt_number: "desc" });
    let allRecords = [];
    for (const sale of receipts) {
      let items = [];
      for (const item of sale.items) {
        let itemsFound = await ItemList.findOne({
          $and: [{ account: account }, { _id: { $in: item.id } }],
        }).populate("category", ["_id", "title"]);
        let newItem = {
          taxes: item.taxes,
          discounts: item.discounts,
          modifiers: item.modifiers,
          _id: item._id,
          categoryId: item.categoryId,
          category: !itemsFound
            ? "No Category"
            : itemsFound.category
            ? itemsFound.category.title
            : "No Category",
          comment: item.comment,
          cost: item.cost,
          auto_id: item.auto_id,
          id: item.id,
          item_number: item.item_number,
          name: item.name,
          pos_sale_id: item.pos_sale_id,
          price: item.price,
          quantity: item.quantity,
          refund_quantity: item.refund_quantity,
          sku: !itemsFound
            ? ""
            : itemsFound.sku && itemsFound.sku !== null
            ? itemsFound.sku
            : item.sku == null
            ? ""
            : item.sku,
          sold_by_type: item.sold_by_type,
          stock_qty: item.stock_qty,
          total_discount: item.total_discount,
          total_modifiers: item.total_modifiers,
          total_price: item.total_price,
          total_tax: item.total_tax,
          total_tax_included: item.total_tax_included,
          track_stock: item.track_stock,
        };
        items.push(newItem);
      }
      sale.items = items;
      allRecords.push(sale);
    }

    let totalSales = allRecords.filter(
      (itm) => itm.receipt_type == "SALE"
    ).length;
    let totalRefunds = allRecords.filter(
      (itm) => itm.receipt_type == "REFUND"
    ).length;
    let totalReceipts = totalSales + totalRefunds;
    totalReceipts = truncateDecimals(decimal, totalReceipts);

    res.status(200).json({
      totalSales,
      totalRefunds,
      totalReceipts,
      receipts: allRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/modifiers", async (req, res) => {
  try {
    const { startDate, endDate, stores, employees } = req.body;
    const { account, decimal } = req.authData;

    // var start = moment(startDate, "YYYY-MM-DD  HH:mm:ss");
    // var end = moment(endDate, "YYYY-MM-DD  HH:mm:ss").add(1, "days");
    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    const receipts = await Sales.find({
      $and: [
        { created_at: { $gte: start, $lte: end } },
        { account: account },
        { open: false },
        { cancelled_at: null },
        { "store._id": { $in: stores } },
        { created_by: { $in: employees } },
      ],
    }).populate("user", "name");

    const modifiers = await Modifier.find({ account: account });

    let reportData = [];
    for (const modifier of modifiers) {
      const optionsDetails = [];
      let sales = await receipts.filter((sale) =>
        sale.items.filter((item) =>
          item.modifiers.filter((mod) => mod.modifier._id == modifier._id)
        )
      );

      // let quantitySold = 0;
      let grossSales = 0;
      // let refundQuantitySold = 0;
      let refundGrossSales = 0;
      let modifierCheck = false;
      if (sales.length > 0) {
        // await sales.map(async sale => {
        for (const sale of sales) {
          // await sale.items.map(async item => {
          for (const item of sale.items) {
            // await item.modifiers.map(async mod => {
            for (const mod of item.modifiers) {
              if (mod.modifier._id == modifier._id) {
                modifierCheck = true;

                for (const option of modifier.options) {
                  let optQuantitySold = 0;
                  let optGrossSales = 0;
                  let optRefundQuantitySold = 0;
                  let optRefundGrossSales = 0;
                  let check = false;

                  // await mod.options.map(opt => {
                  for (const opt of mod.options) {
                    if (option.name == opt.option_name && opt.isChecked) {
                      check = true;
                      if (sale.receipt_type == "SALE") {
                        optQuantitySold =
                          optQuantitySold + parseInt(item.quantity);
                        optGrossSales += opt.price;
                      } else if (sale.receipt_type == "REFUND") {
                        optRefundQuantitySold =
                          optRefundQuantitySold + parseInt(item.quantity);
                        optRefundGrossSales += opt.price;
                      }
                    }
                  }

                  if (check) {
                    optionsDetails.push({
                      Option: option.name,
                      quantitySold: optQuantitySold,
                      grossSales: truncateDecimals(decimal, optGrossSales),
                      refundQuantitySold: optRefundQuantitySold,
                      refundGrossSales: truncateDecimals(
                        decimal,
                        optRefundGrossSales
                      ),
                    });
                  }
                }
              }
            }
          }
        } // Sale loop end

        if (modifierCheck && optionsDetails.length > 0) {
          let ops = groupBy(optionsDetails, "Option");
          let details = [];
          for (const op of Object.keys(ops)) {
            let qs = 0;
            let gs = 0;
            let rqs = 0;
            let rgs = 0;
            for (const det of ops[op]) {
              qs = qs + det.quantitySold;
              gs = gs + det.quantitySold * det.grossSales;
              rqs = rqs + det.refundQuantitySold;
              rgs = rgs + det.refundQuantitySold * det.refundGrossSales;

              grossSales =
                grossSales + parseFloat(det.quantitySold * det.grossSales);
              refundGrossSales =
                refundGrossSales +
                parseFloat(det.refundQuantitySold * det.refundGrossSales);
            }
            details.push({
              Option: op,
              quantitySold: qs,
              grossSales: parseFloat(gs).toFixed(decimal), //truncateDecimals(decimal, gs),
              refundQuantitySold: rqs,
              refundGrossSales: truncateDecimals(decimal, rgs),
            });
          }
          // for(const det of details){

          // }
          let salesTotal = {
            Modifier: modifier.title,
            group: ops,
            quantitySold: sumBy(details, "quantitySold"),
            grossSales: grossSales, // sumBy(details,'grossSales'),
            refundQuantitySold: sumBy(details, "refundQuantitySold"),
            refundGrossSales: refundGrossSales, //sumBy(details,'refundGrossSales'),
            options: details,
          };
          reportData.push(salesTotal);
        }
      }
    }

    res.status(200).json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/discounts", async (req, res) => {
  try {
    const { startDate, endDate, stores, employees } = req.body;
    const { account, decimal } = req.authData;

    // var start = moment(startDate, "YYYY-MM-DD  HH:mm:ss");
    // var end = moment(endDate, "YYYY-MM-DD  HH:mm:ss").add(1, "days");
    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    const receipts = await Sales.find({
      $and: [
        { created_at: { $gte: start, $lte: end } },
        { account: account },
        { open: false },
        { cancelled_at: null },
        { receipt_type: "SALE" },
        { "store._id": { $in: stores } },
        { created_by: { $in: employees } },
      ],
    }).populate("user", "name");

    const itemDiscounts = [];
    const receiptDiscounts = [];

    await receipts.map((sale) => {
      if (sale.discounts.length > 0) {
        sale.discounts.map((dis) => {
          receiptDiscounts.push(dis);
        });
      }
      return sale.items.map((item) => {
        if (item.discounts.length > 0) {
          item.discounts.map((dis) => {
            dis.discount_total = (dis.value / 100) * item.total_price;
            return itemDiscounts.push(dis);
          });
        }
      });
    });

    let itemGroupDiscounts = groupBy(itemDiscounts, "_id");
    let itemDiscountKeys = Object.keys(itemGroupDiscounts);

    let receiptGroupDiscounts = groupBy(receiptDiscounts, "_id");
    let receiptDiscountKeys = Object.keys(receiptGroupDiscounts);

    let reportData = [];
    for (const key of itemDiscountKeys) {
      reportData.push({
        _id: key,
        title: itemGroupDiscounts[key][0].title,
        applied: itemGroupDiscounts[key].length,
        type: itemGroupDiscounts[key][0].type,
        value: itemGroupDiscounts[key][0].value,
        total: sumBy(itemGroupDiscounts[key], "discount_total"),
      });
    }
    for (const key of receiptDiscountKeys) {
      reportData.push({
        _id: key,
        title: receiptGroupDiscounts[key][0].title,
        applied: receiptGroupDiscounts[key].length,
        type: receiptGroupDiscounts[key][0].type,
        value: receiptGroupDiscounts[key][0].value,
        total: sumBy(receiptGroupDiscounts[key], "value"),
      });
    }

    res.status(200).json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/taxes", async (req, res) => {
  try {
    const { startDate, endDate, stores, employees } = req.body;
    const { account, decimal } = req.authData;

    // var start = moment(startDate, "YYYY-MM-DD  HH:mm:ss");
    // var end = moment(endDate, "YYYY-MM-DD  HH:mm:ss").add(1, "days");
    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    const receipts = await Sales.find({
      $and: [
        { created_at: { $gte: start, $lte: end } },
        { account: account },
        { open: false },
        { cancelled_at: null },
        { receipt_type: "SALE" },
        { "store._id": { $in: stores } },
        { created_by: { $in: employees } },
      ],
    }).populate("user", "name");

    const reportData = [];
    const itemTaxes = [];
    let taxableSales = 0;
    let NonTaxableSales = 0;
    let NetSales = 0;

    await receipts.map((sale) => {
      if (
        (sale.total_tax != 0 && sale.total_tax != null) ||
        (sale.total_tax_included != 0 && sale.total_tax_included != null)
      ) {
        taxableSales =
          taxableSales +
          parseFloat(sale.total_price) +
          parseFloat(sale.total_tax_included);
      } else {
        NonTaxableSales = NonTaxableSales + parseFloat(sale.total_price);
      }
      NetSales = NetSales + sale.total_price;

      return sale.items.map((item) => {
        if (item.taxes.length > 0) {
          item.taxes.map((tax) => {
            let data = {
              _id: tax._id,
              isChecked: tax.isChecked,
              isEnabled: tax.isEnabled,
              tax_rate: tax.tax_rate,
              tax_total: tax.tax_total,
              tax_type: tax.tax_type,
              title: tax.title,
              taxableSale: sale.total_price,
            };
            itemTaxes.push(data);
            return data;
          });
        }
      });
    });
    let itemGroupTaxes = groupBy(itemTaxes, "_id");
    let itemTaxesKeys = Object.keys(itemGroupTaxes);

    for (const key of itemTaxesKeys) {
      reportData.push({
        _id: itemGroupTaxes[key][0]._id,
        title: itemGroupTaxes[key][0].title,
        title: itemGroupTaxes[key][0].title,
        tax_rate: itemGroupTaxes[key][0].tax_rate + "%",
        taxableSale: truncateDecimals(
          decimal,
          itemGroupTaxes[key][0].taxableSale
        ),
        taxAmount: truncateDecimals(
          decimal,
          sumBy(itemGroupTaxes[key], "tax_total")
        ),
      });
    }
    taxableSales = truncateDecimals(decimal, taxableSales);
    NonTaxableSales = truncateDecimals(decimal, NonTaxableSales);
    NetSales = truncateDecimals(decimal, NetSales);

    res
      .status(200)
      .json({ taxes: reportData, taxableSales, NonTaxableSales, NetSales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/shifts", async (req, res) => {
  try {
    const { startDate, endDate, stores } = req.body;
    const { account } = req.authData;

    // var start = moment(startDate, "YYYY-MM-DD  HH:mm:ss");
    // var end = moment(endDate, "YYYY-MM-DD  HH:mm:ss").add(1, "days");
    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    const allShifts = await Shifts.find({
      $and: [
        { createdAt: { $gte: start, $lte: end } },
        { account: account },
        { store: { $in: stores } },
        { closed_at: { $exists: true, $ne: null } },
      ],
    })
      .populate("store", ["title"])
      .populate("pos_device", ["title"])
      .populate("opened_by_employee", ["name"])
      .populate("closed_by_employee", ["name"])
      .populate("cash_movements.employee_id", ["name"])
      .populate("payments._id", ["_id", "title"])
      .populate("createdBy", ["name"]);

    res.status(200).json({ shifts: allShifts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
