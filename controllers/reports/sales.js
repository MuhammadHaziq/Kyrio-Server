import express from "express";
import Sales from "../../modals/sales/sales";
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
    var start = moment(startDate).format("YYYY-MM-DD")
    var end = moment(endDate).add(1, 'days').format("YYYY-MM-DD")
    
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
      const daysDiff = moment.duration(moment(endDate).diff(moment(startDate))).asDays();
      var time = moment(endDate).toDate(); // This will return a copy of the Date that the moment uses
          time.setHours(0);
          time.setMinutes(0);
          time.setSeconds(0);
          time.setMilliseconds(0);

      let hours = [];
      let graphRecord = [];
      let i = 0;
      
      if (getNatural(daysDiff) == 0 && divider == "hour") {
        
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
          // let findSale = sales.map(sale => {
            for(const sale of sales){
            var saleTime = moment(sale.created_at).format("HH");
            // if(saleTime >= before && saleTime <= newTime){
            // console.log(saleTime)
            // console.log(before)
            // console.log(newTime)
            // }
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
            // console.log(saleTime+" Sale Time is >= before "+before+" || "+saleTime+" Sale Time is <= "+newTime)
            // console.log(saleTime >= before && saleTime <= newTime)
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
          // console.log(findSale)
          // for(const sale of sales){
          //   let saleTime = moment(sale.created_at)
          //   console.log(before)
            // console.log(newTime)
            // console.log(saleTime.isSameOrAfter(before,'hour'))
            // console.log(saleTime.isSameOrBefore(time,'hour'))
            // if( saleTime.isSameOrAfter(before,'hour') && saleTime.isSameOrBefore(time,'hour') ){
            //   console.log(saleTime)
            //   graphRecord.push({
            //     [time]: sale
            //   })
            // }
          // }
          
          // var TimeSales = await Sales.find({$and: [
          //   {"created_at": {$gte: time}},
          //   {"created_at": {$lt: before}},
          //   {accountId: accountId}
          //   ]});
          //   console.log(TimeSales)
          // graphRecord.push({
          //   [time]: TimeSales
          // })
          i++;
        }
      }
    res.status(200).json({SalesTotal,
      //  earningRows: hours, 
       graphRecord: graphRecord});
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
