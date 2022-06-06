const moment = require("moment");
import { sumBy } from "lodash";
// #START# Sale Summary Functions

export const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

export const truncateDecimals = (decimals, num) => {
  // var numS = num.toString(),
  //   decPos = numS.indexOf("."),
  //   substrLength = decPos == -1 ? numS.length : 1 + decPos + decimals,
  //   trimmedResult = numS.substr(0, substrLength),
  //   finalResult = isNaN(trimmedResult) ? 0 : trimmedResult;
  if(typeof num == "undefined" || num == 0 || num == null || num == ""){
    return (0).toFixed(decimals)
  } else {
    return parseFloat(num,decimals).toFixed(decimals);
  }
  // return amountFormat(num, decimals);
};
export const amountFormat = (num, decimal, sign = "") => {
  return numberWithCommas(num, decimal) + sign;
};
export const numberWithCommas = (num, decimal) => {
  num = parseFloat(num);
  return num
    .toFixed(decimal)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
export const checkDivider = async (divider, saleCreatedAt, matches, index) => {
  if (divider == "Hours") {
    let format = "HH";
    let beforeTime = index;
    let afterTime = index + 1;
    let saleTime = moment(saleCreatedAt).format(format);
    return saleTime >= beforeTime && saleTime < afterTime;
  } else if (divider == "Days") {
    let format = "MMM DD YYYY";
    let match = moment(matches[index].trim(), format);
    let saleDay = moment(saleCreatedAt, format);
    return saleDay.isSame(match, "day");
  } else if (divider == "Weeks") {
    let format = "MMM DD YYYY";

    let saleWeek = moment(saleCreatedAt, format);
    let match = matches[index].split("-");
    let startDay = moment(match[0].trim(), format);
    let endDay = moment(match[1].trim(), format);
    return (
      saleWeek.isSameOrAfter(startDay, "day") &&
      saleWeek.isSameOrBefore(endDay, "day")
    );
  } else if (divider == "Months") {
    let format = "MMM YYYY";
    let match = moment(matches[index].trim(), format);
    let saleMotnh = moment(saleCreatedAt, format);
    return saleMotnh.isSame(match, "month");
  } else if (divider == "Quaters") {
    let format = "MMM DD YYYY";
    let saleQuater = moment(saleCreatedAt, format);
    let match = matches[index].split("-");
    let startMonth = moment(match[0].trim(), format);
    let endMonth = moment(match[1].trim(), format);
    return (
      saleQuater.isSameOrAfter(startMonth, "month") &&
      saleQuater.isSameOrBefore(endMonth, "month")
    );
  } else if (divider == "Years") {
    let format = "YYYY";
    var saleYear = moment(sale.created_at, format);
    let match = moment(matches[index].trim(), format);
    return saleYear.isSame(match, "year");
  }
};
export const filterSales = async (sales, divider, matches, decimal) => {
  try {

    let sale_total = 0;//sumBy(allSales, "sub_total");
    let refund_total = 0;//sumBy(allRefunds, "total_price");

    let sale_discount_total = 0;//sumBy(allSales, "total_discount");
    let refund_discount_total = 0;//sumBy(allRefunds, "total_discount");

    let sale_cost_total = 0;//sumBy(allSales, "cost_of_goods");
    let refund_cost_total = 0;//sumBy(allRefunds, "cost_of_goods");

    let sale_tax_total = 0;//sumBy(allSales, "total_tax");

    for(const sale of sales){
      if(sale.receipt_type === "SALE"){
        sale_total += sale.sub_total
        sale_discount_total += sale.total_discount
        sale_cost_total += sale.cost_of_goods
      } else if(sale.receipt_type === "REFUND"){
        refund_total += sale.refund_total
        refund_discount_total += sale.total_discount
        refund_cost_total += sale.cost_of_goods
      }
    }

    let TotalGrossSales = sale_total;
    let TotalRefunds = refund_total;
    let TotalDiscounts = sale_discount_total - refund_discount_total
    let TotalNetSale =  sale_total;
    let CostOfGoods = sale_cost_total - refund_cost_total;
    let TotalGrossProfit = 0;

    TotalNetSale = TotalGrossSales - TotalDiscounts - TotalRefunds;
    TotalGrossProfit = TotalNetSale - CostOfGoods;

    let SalesTotal = {
      GrossSales: truncateDecimals(decimal, TotalGrossSales),
      Refunds: truncateDecimals(decimal, TotalRefunds),
      discounts: truncateDecimals(decimal, TotalDiscounts),
      NetSales: truncateDecimals(decimal, TotalNetSale),
      CostOfGoods: truncateDecimals(decimal, CostOfGoods),
      GrossProfit: truncateDecimals(decimal, TotalGrossProfit),
    };

    let TableRecord = [];
    let graphRecord = {
      GrossSales: [],
      Refunds: [],
      discounts: [],
      NetSales: [],
      CostOfGoods: [],
      GrossProfit: [],
    };

    var i = 0;
    while (i <= matches.length) {
      if (typeof matches[i] !== "undefined") {
        let TotalGrossSales = 0;
        let TotalRefunds = 0;
        let TotalDiscounts = 0;
        let TotalNetSale = 0;
        let CostOfGoods = 0;
        let TotalGrossProfit = 0;
        let TotalMargin = 0;
        let TotalTax = 0;
        let SaleTotalTax = 0;
        let totals = 0;

        for (const sale of sales) {
          if (await checkDivider(divider, sale.created_at, matches, i)) {
            if (sale.receipt_type == "SALE") {
              TotalNetSale += sale.total_price;
              TotalDiscounts += sale.total_discount;
              CostOfGoods += sale.cost_of_goods;
              TotalGrossSales += sale.sub_total;
              TotalTax += (sale.total_tax +sale.total_tax_included);
              SaleTotalTax += sale.total_tax;
            } else if (sale.receipt_type == "REFUND") {
              TotalRefunds += sale.total_price;
              TotalDiscounts = TotalDiscounts - sale.total_discount;
              CostOfGoods = CostOfGoods - sale.cost_of_goods;
              TotalTax = TotalTax - (sale.total_tax + sale.total_tax_included);
              SaleTotalTax = SaleTotalTax - sale.total_tax;
            }
          }
        }
        TotalNetSale = TotalGrossSales - TotalDiscounts - TotalRefunds;
        TotalGrossProfit = TotalNetSale - CostOfGoods;
        
        TotalMargin = ((TotalGrossProfit / TotalNetSale) *
          100
        ).toFixed(2);
        TotalMargin = isNaN(TotalMargin) ? 0 : TotalMargin;

        let summaryDate = "";
        let format = "MMM DD, YYYY";
        if (divider == "Days") {
          summaryDate = moment(matches[i].trim(), format).format(format);
        } else if (divider == "Weeks") {
          let match = matches[i].split("-");
          let startDay = moment(match[0].trim(), format).format(format);
          let endDay = moment(match[1].trim(), format).format(format);
          summaryDate = startDay + " - " + endDay;
        } else if (divider == "Quaters") {
          let match = matches[i].split("-");
          let startDay = moment(match[0].trim(), format).format(format);
          let endDay = moment(match[1].trim(), format).format(format);
          summaryDate = startDay + " - " + endDay;
        } else if (divider == "Months") {
          summaryDate = moment(matches[i].trim(), "MMM DD, YYYY").format(
            format
          );
        }
        if (summaryDate == "") {
          summaryDate = matches[i].trim();
        }

        totals = {
          Date: summaryDate,
          GrossSales: truncateDecimals(decimal, TotalGrossSales),
          Refunds: truncateDecimals(decimal, TotalRefunds),
          discounts: truncateDecimals(decimal, TotalDiscounts),
          NetSales: truncateDecimals(decimal, TotalNetSale),
          CostOfGoods: truncateDecimals(decimal, CostOfGoods),
          GrossProfit: truncateDecimals(decimal, TotalGrossProfit),
          Margin: truncateDecimals(decimal, TotalMargin),
          Tax: truncateDecimals(decimal, TotalTax),
        };
        TableRecord.push(totals);
        graphRecord.GrossSales.push(truncateDecimals(decimal, TotalGrossSales));
        graphRecord.Refunds.push(truncateDecimals(decimal, TotalRefunds));
        graphRecord.discounts.push(truncateDecimals(decimal, TotalDiscounts));
        graphRecord.NetSales.push(truncateDecimals(decimal, TotalNetSale));
        graphRecord.CostOfGoods.push(truncateDecimals(decimal, CostOfGoods));
        graphRecord.GrossProfit.push(truncateDecimals(decimal, TotalGrossProfit));
      }
      i++;
    }
    
    if (sales.length <= 0) {
      TableRecord = [];
    }
    return { SalesTotal, graphRecord, summary: TableRecord };
  } catch (error) {
    return {
      SalesTotal: {},
      graphRecord: [],
      summary: [],
      message: error.message,
    };
  }
};
export const filterItemSales = async (
  sales,
  topFiveItems,
  divider,
  matches,
  decimal
) => {
  try {
    let NetSales = [];

    var i = 0;
    while (i <= matches.length) {
      if (typeof matches[i] !== "undefined") {
        let TotalGrossSales = 0;
        let TotalRefunds = 0;
        let TotalDiscounts = 0;
        let TotalNetSale = 0;
        let CostOfGoods = 0;
        let SaleTotalTax = 0;

        for (const sale of sales) {
          let found = sale.items.filter((itm) =>
            topFiveItems.filter((item) => item._id == itm.id)
          );
          if (found.length > 0) {
            if (await checkDivider(divider, sale.created_at, matches, i)) {
              if (sale.receipt_type == "SALE") {
                TotalNetSale =
                  truncateDecimals(decimal, TotalNetSale) +
                  truncateDecimals(decimal, sumBy(found, "total_price"));
                TotalDiscounts =
                  truncateDecimals(decimal, TotalDiscounts) +
                  truncateDecimals(decimal, sumBy(found, "total_discount"));
                CostOfGoods =
                  truncateDecimals(decimal, CostOfGoods) +
                  truncateDecimals(decimal, sumBy(found, "cost"));
                TotalGrossSales =
                  truncateDecimals(decimal, TotalGrossSales) +
                  truncateDecimals(decimal, sumBy(found, "sub_total"));
                SaleTotalTax =
                  SaleTotalTax +
                  truncateDecimals(decimal, sumBy(found, "total_tax"));
              } else if (sale.receipt_type == "REFUND") {
                TotalRefunds =
                  truncateDecimals(decimal, TotalRefunds) +
                  truncateDecimals(decimal, sumBy(found, "total_price"));
                TotalDiscounts =
                  truncateDecimals(decimal, TotalDiscounts) -
                  truncateDecimals(decimal, sumBy(found, "total_discount"));
                CostOfGoods =
                  truncateDecimals(decimal, CostOfGoods) -
                  truncateDecimals(decimal, sumBy(found, "cost"));
                TotalItemsRefunded =
                  TotalItemsRefunded + sumBy(found, "quantity");
              }
            }
          }
        }
        TotalNetSale =
          truncateDecimals(decimal, TotalGrossSales) -
          truncateDecimals(decimal, TotalDiscounts) -
          truncateDecimals(decimal, TotalRefunds);

        NetSales.push(TotalNetSale);
      }
      i++;
    }
    return { NetSales: NetSales };
  } catch (error) {
    return { NetSales: [], message: error.message };
  }
};

// #END# Sale Summary Functions
