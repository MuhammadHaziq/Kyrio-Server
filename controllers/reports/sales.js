import express from "express";
import Sales from "../../modals/sales/sales";
import Category from "../../modals/items/category";
import ItemList from "../../modals/items/ItemList";
import groupBy from 'lodash/groupBy';
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
      
     let report = await filterSales(startDate, sales, divider, graph, matches)
     
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
      startTime,
      endTime,
      customPeriod,
      divider
    } = req.body;
    const { accountId } = req.authData;
    // 2021-02-08T19:42:55.586+00:00
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    var fromDate = moment(startDate,"YYYY-MM-DD HH:mm:ss")
    var toDate = moment(endDate,"YYYY-MM-DD HH:mm:ss")
    
    var sales = await Sales.find({$and: [
      {"created_at": {$gte: start}},
      {"created_at": {$lte: end}},
      {accountId: accountId}
      ]});
    let TotalGrossSales = 0;
    let TotalRefunds = 0;
    let TotalDiscounts = 0;
    let TotalNetSale = 0;
    let CostOfGoods = 0;
    let TotalGrossProfit = 0;
    let TotalItemsSold = 0;
    let TotalItemsRefunded = 0;
    let TotalMargin = 0;
    // const allCat = await Category.find({ accountId: accountId }).sort({
    //   _id: "desc",
    // });
    let items = [];
    let reportData = [];
      await sales.map(async sale => {
        await sale.items.map(async item => {
          // let itemFound = await ItemList.findOne({ accountId: accountId, _id: item.id });
          // reportData.id = itemFound._id
          // reportData.name = itemFound.name
          // reportData.sku = itemFound.sku
          // reportData.category = typeof itemFound.category !== "undefined" || itemFound.category !== null ? itemFound.category.name : "No category"
            items.push(item.id)
        })
      })
      const uniqueItems = await groupBy(items, function(n) {
        return n;
      });
      
      let result = ""
      for (var itemId of Object.keys(uniqueItems)) {
        let foundItems = await Sales.find({$and: [
          {"created_at": {$gte: start}},
          {"created_at": {$lte: end}},
          {accountId: accountId},
          {"items.id": itemId}
          ]});
         
          TotalItemsSold = 0;
          TotalItemsRefunded = 0;
          for(const sale of foundItems){

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
      // console.log(reportData)
    let itemsReport = reportData;
    // for(const sale of sales){
    //   let reportData = {};
    //   for(const item of sale.items){
    //     let itemFound = await ItemList.findOne({ accountId: accountId, _id: item.id });
    //     reportData.id = itemFound._id
    //     reportData.name = itemFound.name
    //     reportData.sku = itemFound.sku
    //     reportData.category = typeof itemFound.category !== "undefined" || itemFound.category !== null ? itemFound.category.name : "No category"

    //     let itemsSold = await Sales.find({
    //       "items.$.id": item.id,
    //     });
    //     // let itemsSold = await Sales.aggregate([
    //     //   {$match: { "items.$.id": item.id } },
    //     //   {$group: { _id: "items.$.id" }}
    //     // ])
    //     reportData.itemsSold = itemsSold
    //     itemsReport.push(reportData)
    //     console.log(itemsSold)
    //   //   sales.aggregate([
    //   //     { $match: {} },
    //   //     { $group: { _id: null, n: { $sum: 1 } } }
    //   //  ]); 

    //   }
    // }

    res.status(500).json({ data: itemsReport });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
async function checkDivider(startDate, divider, saleCreatedAt, matches, index){
  if (divider == "Hours") {
    
    let format = "HH"
    let beforeTime = index
    let afterTime = index+1
    let saleTime = moment(saleCreatedAt).format(format)
    return saleTime >= beforeTime && saleTime < afterTime

  } else if (divider == "Days") {

    let format = "MMM DD YYYY"
    let match = moment(matches[index].trim(), format);
    let saleDay = moment(saleCreatedAt, format)
    return saleDay.isSame(match,"day")

  } else if (divider == "Weeks") {
    
    let format = "MMM DD YYYY"

    let saleWeek = moment(saleCreatedAt, format)
    let match = matches[index].split("-")
    let startDay = moment(match[0].trim(), format)
    let endDay = moment(match[1].trim(), format)
    return (saleWeek.isSameOrAfter(startDay,"day") && saleWeek.isSameOrBefore(endDay, "day") ) 

  } else if (divider == "Months") {

    let format = "MMM YYYY"
    let match = moment(matches[index].trim(), format)
    let saleMotnh = moment(saleCreatedAt, format)
    return saleMotnh.isSame(match,"month")

  } else if (divider == "Quaters") {
    
    let format = "MMM DD YYYY"
    let saleQuater = moment(saleCreatedAt,format)
    let match = matches[index].split("-")
    let startMonth = moment(match[0].trim(), format)
    let endMonth = moment(match[1].trim(), format)
    return (saleQuater.isSameOrAfter(startMonth,"month") && saleQuater.isSameOrBefore(endMonth,"month"))

  } else if (divider == "Years") {

    let format = "YYYY"
    var saleYear = moment(sale.created_at, format)
    let match = moment(matches[index].trim(), format)
    return saleYear.isSame(match,"year")

  }
}
async function filterSales(startDate, sales, divider, graph, matches){

    let TotalGrossSales = 0;
    let TotalRefunds = 0;
    let TotalDiscounts = 0;
    let TotalNetSale = 0;
    let CostOfGoods = 0;
    let TotalGrossProfit = 0;

      for(const sale of sales){

        if(sale.receipt_type == "SALE"){
          TotalNetSale = parseFloat(TotalNetSale)+parseFloat(sale.total_price)
          TotalDiscounts = parseFloat(TotalDiscounts)+parseFloat(sale.total_discount)
          CostOfGoods = parseFloat(CostOfGoods)+parseFloat(sale.cost_of_goods)
          TotalGrossSales = parseFloat(TotalGrossSales)+parseFloat(sale.total_price)
        } else if(sale.receipt_type == "REFUND"){
          TotalRefunds = parseFloat(TotalRefunds)+parseFloat(sale.total_price)
          TotalDiscounts = parseFloat(TotalDiscounts)-parseFloat(sale.total_discount)
          CostOfGoods = parseFloat(CostOfGoods)-parseFloat(sale.cost_of_goods)
        }
        
      }
      TotalNetSale = parseFloat(TotalGrossSales) - parseFloat(TotalDiscounts) - parseFloat(TotalRefunds)
      TotalGrossProfit = parseFloat(TotalNetSale) - parseFloat(CostOfGoods)
      
      let SalesTotal = {
        GrossSales: TotalGrossSales,
        Refunds: TotalRefunds,
        discounts: TotalDiscounts,
        NetSales: TotalNetSale,
        CostOfGoods: CostOfGoods,
        GrossProfit: TotalGrossProfit
      }

      let TableRecord = [];
      let graphRecord = {
        GrossSales: [],
        Refunds: [],
        discounts: [],
        NetSales: [],
        CostOfGoods: [],
        GrossProfit: []
      };
        
        var i = 0;
        while (i <= matches.length) {
          if(typeof matches[i] !== "undefined"){
            let TotalGrossSales = 0;
            let TotalRefunds = 0;
            let TotalDiscounts = 0;
            let TotalNetSale = 0;
            let CostOfGoods = 0;
            let TotalGrossProfit = 0;
            let TotalMargin = 0;
            let totals = 0;

              for(const sale of sales){
              
              if(await checkDivider(startDate, divider, sale.created_at, matches, i)){
                if(sale.receipt_type == "SALE"){
                  TotalNetSale = parseFloat(TotalNetSale)+parseFloat(sale.total_price)
                  TotalDiscounts = parseFloat(TotalDiscounts)+parseFloat(sale.total_discount)
                  CostOfGoods = parseFloat(CostOfGoods)+parseFloat(sale.cost_of_goods)
                  TotalGrossSales = parseFloat(TotalGrossSales)+parseFloat(sale.total_price)
                } else if(sale.receipt_type == "REFUND"){
                  TotalRefunds = parseFloat(TotalRefunds)+parseFloat(sale.total_price)
                  TotalDiscounts = parseFloat(TotalDiscounts)-parseFloat(sale.total_discount)
                  CostOfGoods = parseFloat(CostOfGoods)-parseFloat(sale.cost_of_goods)
                }
              } 
            }
                TotalNetSale = parseFloat(TotalGrossSales) - parseFloat(TotalDiscounts) - parseFloat(TotalRefunds)
                TotalGrossProfit = parseFloat(TotalNetSale) - parseFloat(CostOfGoods)

                TotalMargin = ((parseFloat(TotalGrossProfit) / parseFloat(TotalNetSale))*100).toFixed(2)
                TotalMargin = isNaN(TotalMargin) ? "0%" : TotalMargin + "%"

                let summaryDate = ""
                let format = "MMM DD, YYYY"
                if (divider == "Days") {
                  
                  summaryDate = moment(matches[i].trim(), format).format(format)

                } else if (divider == "Weeks") {

                  let match = matches[i].split("-")
                  let startDay = moment(match[0].trim(), format).format(format)
                  let endDay = moment(match[1].trim(), format).format(format)
                  summaryDate = startDay +" - "+endDay

                } else if (divider == "Quaters") {
                  
                  let match = matches[i].split("-")
                  let startDay = moment(match[0].trim(), format).format(format)
                  let endDay = moment(match[1].trim(), format).format(format)
                  summaryDate = startDay +" - "+endDay

                }


                totals = {
                  Date: summaryDate,
                  GrossSales: TotalGrossSales,
                  Refunds: TotalRefunds,
                  discounts: TotalDiscounts,
                  NetSales: TotalNetSale,
                  CostOfGoods: CostOfGoods,
                  GrossProfit: TotalGrossProfit,
                  Margin: TotalMargin,
                  Tax: 0
                }
            TableRecord.push(totals)
            graphRecord.GrossSales.push(TotalGrossSales)
            graphRecord.Refunds.push(TotalRefunds)
            graphRecord.discounts.push(TotalDiscounts)
            graphRecord.NetSales.push(TotalNetSale)
            graphRecord.CostOfGoods.push(CostOfGoods)
            graphRecord.GrossProfit.push(TotalGrossProfit)
          }
          i++;
        }

     return {SalesTotal,
      graphRecord: graphRecord,
      summary: TableRecord
    }
}
module.exports = router;
