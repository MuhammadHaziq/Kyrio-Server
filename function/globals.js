const moment = require('moment');
// #START# Sale Summary Functions

export const checkDivider = async (divider, saleCreatedAt, matches, index) => { 
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
export const filterSales = async (sales, divider, matches) => {
  try{
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
                
                if(await checkDivider(divider, sale.created_at, matches, i)){
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
  
                  } else if (divider == "Months") {
                    
                    summaryDate = moment(matches[i].trim(), "MMM DD, YYYY").format(format)
  
                  }
                  if(summaryDate == ""){
                    summaryDate = matches[i].trim()
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
          if(sales.length <= 0){
            TableRecord = []
          }
       return {SalesTotal,
        graphRecord: graphRecord,
        summary: TableRecord
      }
    } catch (error) {
      return {SalesTotal: {},
        graphRecord: [],
        summary: [],
        message: error.message
      }
    }
  }
export const filterItemSales = async (sales, divider, matches) => { 
  try{
        let NetSales = []
          
          var i = 0;
          while (i <= matches.length) {
            if(typeof matches[i] !== "undefined"){
              let TotalGrossSales = 0;
              let TotalRefunds = 0;
              let TotalDiscounts = 0;
              let TotalNetSale = 0;
              let CostOfGoods = 0;
  
                for(const sale of sales){
                
                if(await checkDivider(divider, sale.created_at, matches, i)){
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
  
              NetSales.push(TotalNetSale)
            }
            i++;
          }
       return {NetSales: NetSales}
      } catch (error) {
        return {NetSales: [],
          message: error.message
        }
      }
  }
  
// #END# Sale Summary Functions