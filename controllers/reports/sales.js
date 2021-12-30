import express from "express";
import Sales from "../../modals/sales/sales";
import ItemList from "../../modals/items/ItemList";
import Users from "../../modals/users";
import _, { groupBy, orderBy, slice, isEmpty, sumBy } from 'lodash';
import Modifier from "../../modals/items/Modifier";
import { truncateDecimals, filterSales, filterItemSales } from "../../function/globals"
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
      matches
    } = req.body;
    
    // req.io.emit("sale",{message: "Sale Summary"})

    const { account, decimal } = req.authData;
    // 2021-02-08T19:42:55.586+00:00
    var start = moment(startDate,"YYYY-MM-DD")
    var end = moment(endDate,"YYYY-MM-DD").add(1, 'days')
    // var compareStartDate = "";
    // var compareEndDate = "";
    // if(divider == "Hours"){

    // } else if(divider == "Days"){

    // } else if(divider == "Weeks"){
      
    // } else if(divider == "Months"){
      
    // } else if(divider == "Quaters"){
      
    // } else if(divider == "Years"){
      
    // }
    
    var sales = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      {cancelled_at: null },
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]})
     let report = await filterSales(sales, divider, matches, decimal)
     
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
    const { account, decimal } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    var sales = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      {cancelled_at: null },
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]});
      
    let items = []
    await sales.map(itm => itm.items.map(item => { items.push(item.id)}))
    items = await groupBy(items)
    
    let reportData = [];
    let itemKeys = Object.keys(items)
      
    let itemsFound = await ItemList.find({$and: [
      { account: account},
      { _id: { "$in" : itemKeys} },
      ]}).populate('category', ["_id","title"])
    
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
          for(const sale of sales){
            let found = sale.items.filter(itm => itm.id == item._id)
            if(found.length > 0){
              
              if(sale.receipt_type == "SALE"){
                TotalNetSale = truncateDecimals(decimal,TotalNetSale)+truncateDecimals(decimal,sumBy(found, 'total_price'));
                TotalDiscounts = truncateDecimals(decimal,TotalDiscounts)+truncateDecimals(decimal,sumBy(found, 'total_discount'));
                CostOfGoods = truncateDecimals(decimal,CostOfGoods)+truncateDecimals(decimal,sumBy(found, 'cost'));
                TotalGrossSales = truncateDecimals(decimal,TotalGrossSales)+truncateDecimals(decimal,sumBy(found, 'total_price'));
                TotalItemsSold = TotalItemsSold + parseInt(sumBy(found, 'quantity') - sumBy(found, 'refund_quantity'));
                TotalTax =
                truncateDecimals(decimal,TotalTax) + truncateDecimals(decimal,sumBy(found,'total_tax')) + truncateDecimals(decimal,sumBy(found,'total_tax_included'));
                SaleTotalTax = truncateDecimals(decimal,SaleTotalTax) + truncateDecimals(decimal,sumBy(found,'total_tax'));
              } else if(sale.receipt_type == "REFUND"){
                TotalRefunds = truncateDecimals(decimal,TotalRefunds)+truncateDecimals(decimal,sumBy(found, 'total_price'));
                TotalDiscounts = truncateDecimals(decimal,TotalDiscounts)-truncateDecimals(decimal,sumBy(found, 'total_discount'));
                CostOfGoods = truncateDecimals(decimal,CostOfGoods)-truncateDecimals(decimal,sumBy(found, 'cost'));
                TotalItemsRefunded = TotalItemsRefunded + sumBy(found, 'quantity');
                TotalTax = truncateDecimals(decimal,TotalTax) - truncateDecimals(decimal,sumBy(found,'total_tax')) + truncateDecimals(decimal,sumBy(found,'total_tax_included'));
                SaleTotalTax = truncateDecimals(decimal,SaleTotalTax) - truncateDecimals(decimal,sumBy(found,'total_tax'));
              }
            }
          }
          
          TotalNetSale = truncateDecimals(decimal,TotalGrossSales) - truncateDecimals(decimal,TotalDiscounts) - truncateDecimals(decimal,TotalRefunds);
          TotalGrossProfit = truncateDecimals(decimal,TotalNetSale) - truncateDecimals(decimal,CostOfGoods)
          TotalMargin = (( ( truncateDecimals(decimal,TotalNetSale) - (CostOfGoods) ) / truncateDecimals(decimal,TotalNetSale) ) * 100).toFixed(2);

          let SalesTotal = {
            GrossSales: truncateDecimals(decimal,TotalGrossSales,2),
            Refunds: TotalRefunds,
            discounts: TotalDiscounts,
            NetSales: TotalNetSale,
            CostOfGoods: CostOfGoods,
            GrossProfit: TotalGrossProfit,
            ItemsSold: TotalItemsSold,
            ItemsRefunded: TotalItemsRefunded,
            Margin: TotalMargin,
            Tax: TotalTax,
            id: item._id,
            name: item.title,
            sku: item.sku,
            color: item.color,
            image: item.image,
            category: typeof item.category !== "undefined" && item.category !== null && !isEmpty(item.category) ? item.category.title : "No category"
          }
          reportData.push(SalesTotal)
      }
    let itemsReport = reportData;

    let topFiveItems = orderBy(reportData, ['NetSales'],['desc']); // Use Lodash to sort array by 'NetSales'
    topFiveItems = slice(topFiveItems, [start=0], [end=5])
    
    let graphRecord = await filterItemSales(sales, topFiveItems, divider, matches, decimal);

    res.status(200).json({ itemsReport, topFiveItems, graphRecord });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

router.post("/category", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees
    } = req.body;
    const { account, decimal } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    var sales = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      {cancelled_at: null },
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]});

      // let items = await groupBy(sales.map(itm => itm.items.map(item => { return item.id})[0]))
      let items = []
      await sales.map(itm => itm.items.map(item => { items.push(item.id)}))
      items = await groupBy(items)
   
      let reportData = [];
      let itemKeys = Object.keys(items)

      let itemsFound = await ItemList.find({$and: [
        { account: account},
        { _id: { "$in" : itemKeys} },
        ]}).populate('category', ["_id","title"]);
        
      let categories = await groupBy(itemsFound.map(itm =>{return itm.category !== null ? typeof itm.category !== "undefined" && typeof itm.category.title !== "undefined" ? itm.category.title : "No category" : "No category" }));
      let catKeys = Object.keys(categories)

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
        let SalesTotal = {}

          TotalItemsSold = 0;
          TotalItemsRefunded = 0;

          for (var item of itemsFound) {
          let category = item.category !== null ? typeof item.category !== "undefined" && typeof item.category.title !== "undefined" ? item.category.title : "No category" : "No category";
          if(cat == category){
           
            
            for(const sale of sales){
              let found = sale.items.filter(itm => itm.id == item._id)
              if(found.length > 0){
                
                if(sale.receipt_type == "SALE"){
                  TotalNetSale = truncateDecimals(decimal, TotalNetSale)+truncateDecimals(decimal, sumBy(found, 'total_price'))
                  TotalDiscounts = truncateDecimals(decimal, TotalDiscounts)+truncateDecimals(decimal, sumBy(found, 'total_discount'))
                  CostOfGoods = truncateDecimals(decimal, CostOfGoods)+truncateDecimals(decimal, sumBy(found, 'cost'))
                  TotalGrossSales = truncateDecimals(decimal, TotalGrossSales)+truncateDecimals(decimal, sumBy(found, 'total_price'))
                  TotalItemsSold = TotalItemsSold + sumBy(found, 'quantity');
                  TotalTax = truncateDecimals(decimal, TotalTax) + truncateDecimals(decimal, sumBy(found,'total_tax')) + truncateDecimals(decimal, sumBy(found,'total_tax_included'));
                  SaleTotalTax = truncateDecimals(decimal, SaleTotalTax) + truncateDecimals(decimal, sumBy(found,'total_tax'));
                } else if(sale.receipt_type == "REFUND"){
                  TotalRefunds = truncateDecimals(decimal, TotalRefunds)+truncateDecimals(decimal, sumBy(found, 'total_price'))
                  TotalDiscounts = truncateDecimals(decimal, TotalDiscounts)-truncateDecimals(decimal, sumBy(found, 'total_discount'))
                  CostOfGoods = truncateDecimals(decimal, CostOfGoods)-truncateDecimals(decimal, sumBy(found, 'cost'))
                  TotalItemsRefunded = TotalItemsRefunded + sumBy(found, 'quantity');
                  TotalTax = truncateDecimals(decimal, TotalTax) - truncateDecimals(decimal, sumBy(found,'total_tax')) + truncateDecimals(decimal, sumBy(found,'total_tax_included'));
                  SaleTotalTax = truncateDecimals(decimal, SaleTotalTax) - truncateDecimals(decimal, sumBy(found,'total_tax'));
                }
              }
            }
            TotalNetSale = truncateDecimals(decimal, TotalGrossSales) - truncateDecimals(decimal, TotalDiscounts) - truncateDecimals(decimal, TotalRefunds)
            TotalGrossProfit = truncateDecimals(decimal, TotalNetSale) - truncateDecimals(decimal, CostOfGoods)
            TotalMargin = (( ( truncateDecimals(decimal, TotalNetSale) - (CostOfGoods) ) / truncateDecimals(decimal, TotalNetSale) ) * 100).toFixed(2);
          }
        }
        SalesTotal = {
          GrossSales: TotalGrossSales,
          Refunds: TotalRefunds,
          discounts: TotalDiscounts,
          NetSales: TotalNetSale,
          CostOfGoods: CostOfGoods,
          GrossProfit: TotalGrossProfit,
          ItemsSold: TotalItemsSold,
          Tax: TotalTax,
          ItemsRefunded: TotalItemsRefunded,
          Margin: TotalMargin,
          category: cat
        }
        reportData.push(SalesTotal)
      }
    // let itemsReport = await groupBy(reportData.map(itm =>{return itm.category}));

      res.status(200).json(reportData)
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

router.post("/employee", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees
    } = req.body;
    const { account, decimal } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    let sales = await Sales.aggregate([
      { $match: { created_at: {$gte: new Date(start), $lte: new Date(end)}, account: account, cancelled_at: null, "store._id": { "$in" : stores}, created_by: { "$in" : employees} } },
      { $group: {_id: "$created_by", sales: {$push: "$$ROOT"} } },
    ]);
    
    let reportData = [];
    
      for (var empSale of sales) {
        
            let emp = await Users.findOne({$and: [
              { account: account},
              { _id: { "$in" : empSale._id} },
            ]}).select("name")
    
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

          for(const sale of empSale.sales){
              if(sale.receipt_type == "SALE"){
                TotalNetSale = truncateDecimals(decimal, TotalNetSale)+truncateDecimals(decimal, sale.total_price)
                TotalDiscounts = truncateDecimals(decimal, TotalDiscounts)+truncateDecimals(decimal, sale.total_discount)
                CostOfGoods = truncateDecimals(decimal, CostOfGoods)+truncateDecimals(decimal, sale.cost_of_goods)
                TotalGrossSales = truncateDecimals(decimal, TotalGrossSales)+truncateDecimals(decimal, sale.sub_total)
                TotalTax = truncateDecimals(decimal, TotalTax) + truncateDecimals(decimal, sale.total_tax) + truncateDecimals(decimal, sale.total_tax_included);
                SaleTotalTax = truncateDecimals(decimal, SaleTotalTax) + truncateDecimals(decimal, sale.total_tax);
              } else if(sale.receipt_type == "REFUND"){
                TotalRefunds = truncateDecimals(decimal, TotalRefunds)+truncateDecimals(decimal, sale.total_price)
                TotalDiscounts = truncateDecimals(decimal, TotalDiscounts)-truncateDecimals(decimal, sale.total_discount)
                CostOfGoods = truncateDecimals(decimal, CostOfGoods)-truncateDecimals(decimal, sale.cost_of_goods)
                TotalTax = truncateDecimals(decimal, TotalTax) - truncateDecimals(decimal, sale.total_tax) + truncateDecimals(decimal, sale.total_tax_included);
                SaleTotalTax = truncateDecimals(decimal, SaleTotalTax) - truncateDecimals(decimal, sale.total_tax);
                TotalItemsRefunded++
              }
              TotalItemsSold++
          }
          TotalNetSale = truncateDecimals(decimal, TotalGrossSales) - truncateDecimals(decimal, TotalDiscounts) - truncateDecimals(decimal, TotalRefunds)
          TotalGrossProfit = truncateDecimals(decimal, TotalNetSale) - truncateDecimals(decimal, CostOfGoods)
          TotalMargin = (( ( truncateDecimals(decimal, TotalNetSale) - (CostOfGoods) ) / truncateDecimals(decimal, TotalNetSale) ) * 100).toFixed(2);

          let SalesTotal = {
            GrossSales: TotalGrossSales,
            Refunds: TotalRefunds,
            discounts: TotalDiscounts,
            NetSales: TotalNetSale,
            CostOfGoods: CostOfGoods,
            GrossProfit: TotalGrossProfit,
            ItemsSold: TotalItemsSold,
            Tax: TotalTax,
            Receipts: empSale.sales.length,
            AverageSale: truncateDecimals(decimal, TotalNetSale/empSale.sales.length),
            ItemsRefunded: TotalItemsRefunded,
            Margin: TotalMargin,
            Name: emp.name
          }
          reportData.push(SalesTotal)
      }

      res.status(200).json(reportData)
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

router.post("/receipts", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees,
    } = req.body;
    const { account, decimal } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    var receipts = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]}).populate('user','name').populate("cancelled_by", ["_id", "name"]).sort({ receipt_number: "desc" });
      
      let totalSales = receipts.filter(itm => itm.receipt_type == "SALE").length
      let totalRefunds = receipts.filter(itm => itm.receipt_type == "REFUND").length
      let totalReceipts = truncateDecimals(decimal, totalSales) + truncateDecimals(decimal, totalRefunds);

      res.status(200).json({
        totalSales,
        totalRefunds,
        totalReceipts,
        receipts
      })
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

router.post("/paymentstypes", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees,
    } = req.body;
    const { account, decimal } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    var receipts = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]}).populate('user','name');

      const paymentMethods = await groupBy(receipts.map(sale => sale.payment_method))

      let paymentKeys = Object.keys(paymentMethods)
      let reportData = [];
    
      for (var payment of paymentKeys) {
    
        let TotalGrossSales = 0;
        let TotalRefunds = 0;
        let TotalDiscounts = 0;
        let TotalNetSale = 0;
        let CostOfGoods = 0;
        let TotalGrossProfit = 0;
        let TotalItemsSold = 0;
        let TotalItemsRefunded = 0;
        let TotalMargin = 0;

          TotalItemsSold = 0;
          TotalItemsRefunded = 0;
          let sales = receipts.filter(sale => sale.payment_method == payment)
          for(const sale of sales){
              if(sale.receipt_type == "SALE"){
                TotalNetSale = truncateDecimals(decimal, TotalNetSale)+truncateDecimals(decimal, sale.total_price)
                TotalDiscounts = truncateDecimals(decimal, TotalDiscounts)+truncateDecimals(decimal, sale.total_discount)
                CostOfGoods = truncateDecimals(decimal, CostOfGoods)+truncateDecimals(decimal, sale.cost_of_goods)
                TotalGrossSales = truncateDecimals(decimal, TotalGrossSales)+truncateDecimals(decimal, sale.total_price)
                TotalItemsSold++
              } else if(sale.receipt_type == "REFUND"){
                TotalRefunds = truncateDecimals(decimal, TotalRefunds)+truncateDecimals(decimal, sale.total_price)
                TotalDiscounts = truncateDecimals(decimal, TotalDiscounts)-truncateDecimals(decimal, sale.total_discount)
                CostOfGoods = truncateDecimals(decimal, CostOfGoods)-truncateDecimals(decimal, sale.cost_of_goods)
                TotalItemsRefunded++
              }
          }
          TotalNetSale = truncateDecimals(decimal, TotalGrossSales) - truncateDecimals(decimal, TotalRefunds);

          TotalGrossProfit = truncateDecimals(decimal, TotalNetSale) - truncateDecimals(decimal, CostOfGoods)
          TotalMargin = (( ( truncateDecimals(decimal, TotalNetSale) - (CostOfGoods) ) / truncateDecimals(decimal, TotalNetSale) ) * 100).toFixed(2);

          let SalesTotal = {
            GrossSales: truncateDecimals(decimal, TotalGrossSales),
            Refunds: truncateDecimals(decimal, TotalRefunds),
            discounts: truncateDecimals(decimal, TotalDiscounts),
            NetSales: truncateDecimals(decimal, TotalNetSale),
            CostOfGoods: truncateDecimals(decimal, CostOfGoods),
            GrossProfit: truncateDecimals(decimal, TotalGrossProfit),
            ItemsSold: TotalItemsSold,
            ItemsRefunded: TotalItemsRefunded,
            Margin: TotalMargin,
            PaymentType: payment
          }
          reportData.push(SalesTotal)
      }
      res.status(200).json(reportData)
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

router.post("/modifiers", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees,
    } = req.body;
    const { account, decimal } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    const receipts = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      { "store._id": { "$in" : stores} }, 
      { created_by: { "$in" : employees} },
      ]}).populate('user','name');

    const modifiers = await Modifier.find({ account: account })
     
      let reportData = [];
      for(const modifier of modifiers){
        
        
        const optionsDetails = []
        let sales = await receipts.filter(sale => sale.items.filter(item => item.modifiers.filter(mod =>  mod.modifier._id == modifier._id)))

        // let quantitySold = 0;
        let grossSales = 0;
        // let refundQuantitySold = 0;
        let refundGrossSales = 0;
        let modifierCheck = false
        if(sales.length > 0) {
          // await sales.map(async sale => { 
          for(const sale of sales){ 
            // await sale.items.map(async item => {
              for(const item of sale.items){ 
              // await item.modifiers.map(async mod => {
                for(const mod of item.modifiers){ 
                
                if(mod.modifier._id == modifier._id){
                  modifierCheck = true
                  
                  for(const option of modifier.options){
                    let optQuantitySold = 0;
                    let optGrossSales = 0;
                    let optRefundQuantitySold = 0;
                    let optRefundGrossSales = 0;
                    let check = false;

                    // await mod.options.map(opt => {
                      for(const opt of mod.options){
                      if(option.name == opt.option_name && opt.isChecked){
                        check = true
                        if(sale.receipt_type == "SALE"){
                          optQuantitySold = optQuantitySold + parseInt(item.quantity)
                          optGrossSales = optGrossSales + truncateDecimals(decimal, opt.price)
                        } else if(sale.receipt_type == "REFUND"){
                          optRefundQuantitySold = optRefundQuantitySold + parseInt(item.quantity)
                          optRefundGrossSales = optRefundGrossSales + truncateDecimals(decimal, opt.price)
                        }
                      }
                    }
                    
                    if(check){
                      
                      optionsDetails.push({
                        Option: option.name,
                        quantitySold: optQuantitySold,
                        grossSales: truncateDecimals(decimal, optGrossSales),
                        refundQuantitySold: optRefundQuantitySold,
                        refundGrossSales: truncateDecimals(decimal, optRefundGrossSales)
                      })
                    }
                  }
                }

              }
            }
          } // Sale loop end

          
          if(modifierCheck && optionsDetails.length > 0){
            let ops = groupBy(optionsDetails,'Option')
            let details = [];
            for(const op of Object.keys(ops)){
              let qs = 0;
              let gs = 0;
              let rqs = 0;
              let rgs = 0;
              for(const det of ops[op]){
                qs = qs + det.quantitySold;
                gs = gs + (det.quantitySold*det.grossSales)
                rqs = rqs + det.refundQuantitySold;
                rgs = rgs + (det.refundQuantitySold*det.refundGrossSales)

                grossSales = grossSales + parseFloat(det.quantitySold*det.grossSales)
                refundGrossSales = refundGrossSales + parseFloat(det.refundQuantitySold*det.refundGrossSales)
              }
              details.push({
                Option: op,
                quantitySold: qs,
                grossSales: parseFloat(gs).toFixed(decimal),//truncateDecimals(decimal, gs),
                refundQuantitySold: rqs,
                refundGrossSales: truncateDecimals(decimal, rgs)
              })
            }
            // for(const det of details){
              
            // }
            let salesTotal = {
              Modifier: modifier.title,
              group: ops,
              quantitySold: sumBy(details,'quantitySold'),
              grossSales: grossSales, // sumBy(details,'grossSales'),
              refundQuantitySold: sumBy(details,'refundQuantitySold'),
              refundGrossSales: refundGrossSales, //sumBy(details,'refundGrossSales'),
              options: details
            }
            reportData.push(salesTotal)
          }
        }
      }
      
      res.status(200).json(reportData)
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

router.post("/discounts", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees,
    } = req.body;
    const { account, decimal } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    const receipts = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      {receipt_type: "SALE"},
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]}).populate('user','name');
    
     const itemDiscounts = [];
     const receiptDiscounts = [];
     
     await receipts.map(sale => { 
        if(sale.discounts.length > 0){
          sale.discounts.map(dis => {
            receiptDiscounts.push(dis)
          })
        }
        return sale.items.map(item => { 
          if(item.discounts.length > 0){
            item.discounts.map(dis => itemDiscounts.push(dis))
          }
        })
      })

      let itemGroupDiscounts = groupBy(itemDiscounts,'_id')
      let itemDiscountKeys = Object.keys(itemGroupDiscounts)
    
      let receiptGroupDiscounts = groupBy(receiptDiscounts,'_id')
      let receiptDiscountKeys = Object.keys(receiptGroupDiscounts)
      
      

      let reportData = [];
      for(const key of itemDiscountKeys){
        reportData.push({
          _id: key,
          title: itemGroupDiscounts[key][0].title,
          applied: itemGroupDiscounts[key].length,
          type: itemGroupDiscounts[key][0].type,
          value: itemGroupDiscounts[key][0].value,
          total: truncateDecimals(decimal, sumBy(itemGroupDiscounts[key], 'discount_total'))
        })
      }
      for(const key of receiptDiscountKeys){
        reportData.push({
          _id: key,
          title: receiptGroupDiscounts[key][0].title,
          applied: receiptGroupDiscounts[key].length,
          type: receiptGroupDiscounts[key][0].type,
          value: receiptGroupDiscounts[key][0].value,
          total: truncateDecimals(decimal, sumBy(receiptGroupDiscounts[key], 'value'))
        })
      }
      
      
      res.status(200).json(reportData)
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

router.post("/taxes", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees,
    } = req.body;
    const { account, decimal } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    const receipts = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      {receipt_type: "SALE"},
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]}).populate('user','name');
    
     const reportData = [];
     const itemTaxes = [];
     let taxableSales = 0;
     let NonTaxableSales = 0;
     let NetSales = 0;

     
     await receipts.map(sale => {
       if((sale.total_tax != 0 && sale.total_tax != null) || (sale.total_tax_included != 0 && sale.total_tax_included != null)){
        taxableSales = taxableSales + parseFloat(sale.total_price) + parseFloat(sale.total_tax_included);
       } else {
        NonTaxableSales = NonTaxableSales + parseFloat(sale.total_price);
       }
       NetSales = NetSales + sale.total_price;

       return sale.items.map(item => { 
          if(item.taxes.length > 0){
            item.taxes.map(tax => {
              let data = {
                _id: tax._id,
                isChecked: tax.isChecked,
                isEnabled: tax.isEnabled,
                tax_rate: tax.tax_rate,
                tax_total: tax.tax_total,
                tax_type: tax.tax_type,
                title: tax.title,
                taxableSale: sale.total_price
              }
              itemTaxes.push(data)
              return data;
            })
          }
        })
     })
     let itemGroupTaxes = groupBy(itemTaxes,'_id')
     let itemTaxesKeys = Object.keys(itemGroupTaxes)
     
     for(const key of itemTaxesKeys){
      reportData.push({
        _id: itemGroupTaxes[key][0]._id,
        title: itemGroupTaxes[key][0].title,
        title: itemGroupTaxes[key][0].title,
        tax_rate: itemGroupTaxes[key][0].tax_rate+"%",
        taxableSale: truncateDecimals(decimal, itemGroupTaxes[key][0].taxableSale),
        taxAmount: truncateDecimals(decimal, sumBy(itemGroupTaxes[key], 'tax_total'))
      })
     }
     taxableSales = truncateDecimals(decimal, taxableSales);
     NonTaxableSales = truncateDecimals(decimal, NonTaxableSales);
     NetSales = truncateDecimals(decimal, NetSales);
      
      res.status(200).json({taxes: reportData, taxableSales,
        NonTaxableSales,
        NetSales})
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

router.post("/shifts", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      stores,
      employees,
    } = req.body;
    const { account, decimal } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    const receipts = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      {receipt_type: "SALE"},
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]}).populate('user','name');
    
     const reportData = [];
     const itemTaxes = [];
     let taxableSales = 0;
     let NonTaxableSales = 0;
     let NetSales = 0;

     
     await receipts.map(sale => {
       if(sale.total_tax != 0 && sale.total_tax != null ){
        taxableSales = taxableSales + sale.total_price;
       } else {
        NonTaxableSales = NonTaxableSales + sale.total_price;
       }
       NetSales = NetSales + sale.total_price;

       return sale.items.map(item => { 
          if(item.taxes.length > 0){
            item.taxes.map(tax => {
              let data = {
                _id: tax._id,
                isChecked: tax.isChecked,
                isEnabled: tax.isEnabled,
                tax_rate: tax.tax_rate,
                tax_total: tax.tax_total,
                tax_type: tax.tax_type,
                title: tax.title,
                taxableSale: sale.total_price
              }
              itemTaxes.push(data)
              return data;
            })
          }
        })
     })
     let itemGroupTaxes = groupBy(itemTaxes,'_id')
     let itemTaxesKeys = Object.keys(itemGroupTaxes)
     
     for(const key of itemTaxesKeys){
      reportData.push({
        _id: itemGroupTaxes[key][0]._id,
        title: itemGroupTaxes[key][0].title,
        title: itemGroupTaxes[key][0].title,
        tax_rate: itemGroupTaxes[key][0].tax_rate+"%",
        taxableSale: truncateDecimals(decimal, itemGroupTaxes[key][0].taxableSale),
        taxAmount: truncateDecimals(decimal, sumBy(itemGroupTaxes[key], 'tax_total'))
      })
     }
     taxableSales = truncateDecimals(decimal, taxableSales);
     NonTaxableSales = truncateDecimals(decimal, NonTaxableSales);
     NetSales = truncateDecimals(decimal, NetSales);
      
      res.status(200).json({reportData, taxableSales,
        NonTaxableSales,
        NetSales})
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})


module.exports = router;
