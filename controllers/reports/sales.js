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
      startTime,
      endTime,
      customPeriod,
      divider
    } = req.body;
    const { accountId } = req.authData;
    // 2021-02-08T19:42:55.586+00:00
    var start = moment(startDate,"YYYY-MM-DD")
    var end = moment(endDate,"YYYY-MM-DD").add(1, 'days')
    
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
      const daysDiff = moment.duration(toDate.diff(fromDate)).asDays();
      var time = toDate.toDate(); // This will return a copy of the Date that the moment uses
          time.setHours(0);
          time.setMinutes(0);
          time.setSeconds(0);
          time.setMilliseconds(0);

      const monthDiff = moment.duration(toDate.diff()).asMonths();
      const diff = getNatural(monthDiff) === 0 ? 1 : getNatural(monthDiff);

      let hours = [];
      let graphRecord = [];
      let days = [];
      let weeks = [];
      
      if (getNatural(daysDiff) == 0 && divider == "Hours") {
        
        const totalHours = 24;
        var i = 1;
        while (i <= totalHours) {
          let HourTotalGrossSales = 0;
          let HourTotalRefunds = 0;
          let HourTotalDiscounts = 0;
          let HourTotalNetSale = 0;
          let HourCostOfGoods = 0;
          let HourTotalGrossProfit = 0;
          hours.push(moment(time).format("LT"));
          let before = moment(time).format("HH");
          time = moment(time).add(1, "hours").format("YYYY-MM-DD HH:mm:ss");
          let newTime = moment(time).format("HH");
          var totals = "";
            for(const sale of sales){
            var saleTime = moment(sale.created_at).format("HH");
            if(saleTime >= before && saleTime < newTime){
              if(sale.receipt_type == "SALE"){
                HourTotalNetSale = parseFloat(HourTotalNetSale)+parseFloat(sale.total_price)
                HourTotalDiscounts = parseFloat(HourTotalDiscounts)+parseFloat(sale.total_discount)
                HourCostOfGoods = parseFloat(HourCostOfGoods)+parseFloat(sale.cost_of_goods)
                HourTotalGrossSales = parseFloat(HourTotalGrossSales)+parseFloat(sale.total_price)
              } else if(sale.receipt_type == "REFUND"){
                HourTotalRefunds = parseFloat(HourTotalRefunds)+parseFloat(sale.total_price)
                HourTotalDiscounts = parseFloat(HourTotalDiscounts)-parseFloat(sale.total_discount)
                HourCostOfGoods = parseFloat(HourCostOfGoods)-parseFloat(sale.cost_of_goods)
              }
            } 
          }
              HourTotalNetSale = parseFloat(HourTotalGrossSales) - parseFloat(HourTotalDiscounts) - parseFloat(HourTotalRefunds)
              HourTotalGrossProfit = parseFloat(HourTotalNetSale) - parseFloat(HourCostOfGoods)
              
              totals = {
                GrossSales: HourTotalGrossSales,
                Refunds: HourTotalRefunds,
                discounts: HourTotalDiscounts,
                NetSales: HourTotalNetSale,
                CostOfGoods: HourCostOfGoods,
                GrossProfit: HourTotalGrossProfit
              }
          graphRecord.push({
            [hours[i-1]]: totals
          })
          i++;
        }
      } else if (getNatural(daysDiff) > 1 && divider == "Days") {
        
        var d = start;
        var i = 0;
        const dateGape = daysDiff >= 60 ? daysDiff / getNatural(monthDiff) : daysDiff;
          
        while (i < getNatural(dateGape)+1) {
          let DaysTotalGrossSales = 0;
          let DaysTotalRefunds = 0;
          let DaysTotalDiscounts = 0;
          let DaysTotalNetSale = 0;
          let DaysCostOfGoods = 0;
          let DaysTotalGrossProfit = 0;
          days.push(d.format("MMM DD"));
          let matchDay = d.format("YYYY MM DD")
          
          var totals = "";
          for(const sale of sales){
            var saleDate = moment(sale.created_at).format("YYYY MM DD")
            
            if(saleDate == matchDay){
              if(sale.receipt_type == "SALE"){
                DaysTotalNetSale = parseFloat(DaysTotalNetSale)+parseFloat(sale.total_price)
                DaysTotalDiscounts = parseFloat(DaysTotalDiscounts)+parseFloat(sale.total_discount)
                DaysCostOfGoods = parseFloat(DaysCostOfGoods)+parseFloat(sale.cost_of_goods)
                DaysTotalGrossSales = parseFloat(DaysTotalGrossSales)+parseFloat(sale.total_price)
              } else if(sale.receipt_type == "REFUND"){
                DaysTotalRefunds = parseFloat(DaysTotalRefunds)+parseFloat(sale.total_price)
                DaysTotalDiscounts = parseFloat(DaysTotalDiscounts)-parseFloat(sale.total_discount)
                DaysCostOfGoods = parseFloat(DaysCostOfGoods)-parseFloat(sale.cost_of_goods)
              }
            }
          }
              DaysTotalNetSale = parseFloat(DaysTotalGrossSales) - parseFloat(DaysTotalDiscounts) - parseFloat(DaysTotalRefunds)
              DaysTotalGrossProfit = parseFloat(DaysTotalNetSale) - parseFloat(DaysCostOfGoods)
              
              totals = {
                GrossSales: DaysTotalGrossSales,
                Refunds: DaysTotalRefunds,
                discounts: DaysTotalDiscounts,
                NetSales: DaysTotalNetSale,
                CostOfGoods: DaysCostOfGoods,
                GrossProfit: DaysTotalGrossProfit
              }
          graphRecord.push({
            [days[i]]: totals
          })
          d = moment(d, "DD-MM-YYYY").add(diff, "days");
          i++;
        }
      } else if (getNatural(daysDiff) > 7 && divider == "Weeks") {
        var d = start;
        let j = 0;
        while (j <= daysDiff) {
          let currentDay = d.day();
          if (j === 0) {
            currentDay = d.day();
          }
          console.log(daysDiff)
          let weekRange = "";
          weekRange = d.format("MMM DD");
          if (currentDay === 7) {
            weekRange = d.format("MMM DD") + " - " + d.format("MMM DD");
            weeks.push(weekRange);
            ++j;
          } else {
            for (; currentDay <= 7; currentDay++) {
              if (
                moment(startDate, "DD-MM-YYYY").isSame(
                  moment(endDate, "DD-MM-YYYY")
                )
              ) {
                weekRange += " - " + d.format("MMM DD");
                weeks.push(weekRange);
                return;
              } else if (currentDay === 6) {
                weekRange += " - " + d.format("MMM DD");
                weeks.push(weekRange);
              }
              d = moment(startDate, "DD-MM-YYYY").add(1, "days");
              ++j;
            }
          }
          // setDays(weeks);
        }
      }
      
    res.status(200).json({SalesTotal,
      weeks: weeks, 
       graphRecord: graphRecord});
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

const getNatural = (num) => {
  return parseFloat(num.toString().split(".")[0]);
};
function convertUTCDateToLocalDate(date) {
  var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;   
}
module.exports = router;
