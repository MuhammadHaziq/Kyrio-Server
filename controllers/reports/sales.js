import express from "express";
import Sales from "../../modals/sales/sales";
import ItemList from "../../modals/items/ItemList";
import { groupBy, orderBy, slice } from 'lodash';
import { filterSales, filterItemSales } from "../../function/globals"
const moment = require('moment');
const router = express.Router();


router.post("/summary", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees,
      divider,
      graph,
      matches
    } = req.body;
    
    // req.io.emit("sale",{message: "Sale Summary"})

    const { accountId } = req.authData;
    // 2021-02-08T19:42:55.586+00:00
    var start = moment(startDate,"YYYY-MM-DD")
    var end = moment(endDate,"YYYY-MM-DD").add(1, 'days')

    
    var sales = await Sales.find({$and: [
      {"created_at": {$gte: start}},
      {"created_at": {$lte: end}},
      {accountId: accountId},
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]});
      
     let report = await filterSales(sales, divider, matches)
     
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/item", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees,
      divider,
      matches
    } = req.body;
    const { accountId } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    var sales = await Sales.find({$and: [
      {"created_at": {$gte: start}},
      {"created_at": {$lte: end}},
      {accountId: accountId},
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]});
    let items = [];
    let reportData = [];
      await sales.map(async sale => {
        await sale.items.map(async item => {
            items.push(item.id)
        })
      })
      const uniqueItems = await groupBy(items, function(n) {
        return n;
      });
      for (var itemId of Object.keys(uniqueItems)) {
        
        let TotalGrossSales = 0;
        let TotalRefunds = 0;
        let TotalDiscounts = 0;
        let TotalNetSale = 0;
        let CostOfGoods = 0;
        let TotalGrossProfit = 0;
        let TotalItemsSold = 0;
        let TotalItemsRefunded = 0;
        let TotalMargin = 0;

        let foundSales = await Sales.find({$and: [
          {"created_at": {$gte: start}},
          {"created_at": {$lte: end}},
          {accountId: accountId},
          { "store._id": { "$in" : stores} },
          
          { created_by: { "$in" : employees} },
          {"items.id": itemId}
          ]});
         
          TotalItemsSold = 0;
          TotalItemsRefunded = 0;
          for(const sale of foundSales){

            if(sale.receipt_type == "SALE"){
              TotalNetSale = parseFloat(TotalNetSale)+parseFloat(sale.total_price)
              TotalDiscounts = parseFloat(TotalDiscounts)+parseFloat(sale.total_discount)
              CostOfGoods = parseFloat(CostOfGoods)+parseFloat(sale.cost_of_goods)
              TotalGrossSales = parseFloat(TotalGrossSales)+parseFloat(sale.total_price)
            } else if(sale.receipt_type == "REFUND"){
              TotalRefunds = parseFloat(TotalRefunds)+parseFloat(sale.total_price)
              TotalDiscounts = parseFloat(TotalDiscounts)-parseFloat(sale.total_discount)
              CostOfGoods = parseFloat(CostOfGoods)-parseFloat(sale.cost_of_goods)
              TotalItemsRefunded++
            }
            TotalItemsSold++
          }
          TotalNetSale = parseFloat(TotalGrossSales) - parseFloat(TotalDiscounts) - parseFloat(TotalRefunds)
          TotalGrossProfit = parseFloat(TotalNetSale) - parseFloat(CostOfGoods)
          TotalMargin = (( ( parseFloat(TotalNetSale) - (CostOfGoods) ) / parseFloat(TotalNetSale) ) * 100).toFixed(2);
          let itemFound = await ItemList.findOne({ accountId: accountId, _id: itemId });
          
          let SalesTotal = {
            GrossSales: TotalGrossSales,
            Refunds: TotalRefunds,
            discounts: TotalDiscounts,
            NetSales: TotalNetSale,
            CostOfGoods: CostOfGoods,
            GrossProfit: TotalGrossProfit,
            ItemsSold: TotalItemsSold,
            ItemsRefunded: TotalItemsRefunded,
            Margin: TotalMargin,
            id: itemFound._id,
            name: itemFound.name,
            sku: itemFound.sku,
            category: typeof itemFound.category !== "undefined" || itemFound.category !== null ? itemFound.category.name : "No category"
          }
          reportData.push(SalesTotal)
      }
    let itemsReport = reportData;

    let topFiveItems = orderBy(reportData, ['NetSales'],['desc']); // Use Lodash to sort array by 'NetSales'
    topFiveItems = slice(topFiveItems, [start=0], [end=5])
    
    let graphRecord = await filterItemSales(sales, topFiveItems, divider, matches);

    res.status(500).json({ itemsReport, topFiveItems, graphRecord });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

router.post("/item", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees,
      divider,
      matches
    } = req.body;
    const { accountId } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    var sales = await Sales.find({$and: [
      {"created_at": {$gte: start}},
      {"created_at": {$lte: end}},
      {accountId: accountId},
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]});
      res.status(200).json(sales)
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

module.exports = router;
