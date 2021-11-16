import express from "express";
import Sales from "../../modals/sales/sales";
import ItemList from "../../modals/items/ItemList";
import Users from "../../modals/users";
import Discount from "../../modals/items/Discount";
import _, { groupBy, orderBy, slice, isEmpty, sumBy } from 'lodash';
import Modifier from "../../modals/items/Modifier";
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
      matches
    } = req.body;
    
    // req.io.emit("sale",{message: "Sale Summary"})

    const { account } = req.authData;
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
    const { account } = req.authData;
    
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

          TotalItemsSold = 0;
          TotalItemsRefunded = 0;
          for(const sale of sales){
            let found = sale.items.filter(itm => itm.id == item._id)
            if(found.length > 0){
              
              if(sale.receipt_type == "SALE"){
                TotalNetSale = parseFloat(TotalNetSale)+parseFloat(sumBy(found, 'total_price'));
                TotalDiscounts = parseFloat(TotalDiscounts)+parseFloat(sumBy(found, 'total_discount'));
                CostOfGoods = parseFloat(CostOfGoods)+parseFloat(sumBy(found, 'cost'));
                TotalGrossSales = parseFloat(TotalGrossSales)+parseFloat(sumBy(found, 'total_price'));
                TotalItemsSold = TotalItemsSold + parseInt(sumBy(found, 'quantity') - sumBy(found, 'refund_quantity'));
                TotalTax =
                parseFloat(TotalTax) + parseFloat(sumBy(found,'total_tax')) + parseFloat(sumBy(found,'total_tax_included'));
              } else if(sale.receipt_type == "REFUND"){
                TotalRefunds = parseFloat(TotalRefunds)+parseFloat(sumBy(found, 'total_price'));
                TotalDiscounts = parseFloat(TotalDiscounts)-parseFloat(sumBy(found, 'total_discount'));
                CostOfGoods = parseFloat(CostOfGoods)-parseFloat(sumBy(found, 'cost'));
                TotalItemsRefunded = TotalItemsRefunded + sumBy(found, 'quantity');
                TotalTax =
                parseFloat(TotalTax) + parseFloat(sumBy(found,'total_tax')) + parseFloat(sumBy(found,'total_tax_included'));
              }
            }
          }
          
          TotalNetSale = parseFloat(TotalGrossSales) - parseFloat(TotalDiscounts) - parseFloat(TotalRefunds)
          TotalGrossProfit = parseFloat(TotalNetSale) - parseFloat(CostOfGoods)
          TotalMargin = (( ( parseFloat(TotalNetSale) - (CostOfGoods) ) / parseFloat(TotalNetSale) ) * 100).toFixed(2);

          let SalesTotal = {
            GrossSales: parseFloat(TotalGrossSales,2),
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
    
    let graphRecord = await filterItemSales(sales, topFiveItems, divider, matches);

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
    const { account } = req.authData;
    
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
                  TotalNetSale = parseFloat(TotalNetSale)+parseFloat(sumBy(found, 'total_price'))
                  TotalDiscounts = parseFloat(TotalDiscounts)+parseFloat(sumBy(found, 'total_discount'))
                  CostOfGoods = parseFloat(CostOfGoods)+parseFloat(sumBy(found, 'cost'))
                  TotalGrossSales = parseFloat(TotalGrossSales)+parseFloat(sumBy(found, 'total_price'))
                  TotalItemsSold = TotalItemsSold + sumBy(found, 'quantity');
                } else if(sale.receipt_type == "REFUND"){
                  TotalRefunds = parseFloat(TotalRefunds)+parseFloat(sumBy(found, 'total_price'))
                  TotalDiscounts = parseFloat(TotalDiscounts)-parseFloat(sumBy(found, 'total_discount'))
                  CostOfGoods = parseFloat(CostOfGoods)-parseFloat(sumBy(found, 'cost'))
                  TotalItemsRefunded = TotalItemsRefunded + sumBy(found, 'quantity');
                }
              }
            }
            TotalNetSale = parseFloat(TotalGrossSales) - parseFloat(TotalDiscounts) - parseFloat(TotalRefunds)
            TotalGrossProfit = parseFloat(TotalNetSale) - parseFloat(CostOfGoods)
            TotalMargin = (( ( parseFloat(TotalNetSale) - (CostOfGoods) ) / parseFloat(TotalNetSale) ) * 100).toFixed(2);
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
    const { account } = req.authData;
    
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

          TotalItemsSold = 0;
          TotalItemsRefunded = 0;

          for(const sale of empSale.sales){
              if(sale.receipt_type == "SALE"){
                TotalNetSale = parseFloat(TotalNetSale)+parseFloat(sale.total_price)
                TotalDiscounts = parseFloat(TotalDiscounts)+parseFloat(sale.total_discount)
                CostOfGoods = parseFloat(CostOfGoods)+parseFloat(sale.cost_of_goods)
                TotalGrossSales = parseFloat(TotalGrossSales)+parseFloat(sale.sub_total)
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
    const { account } = req.authData;
    
    var start = moment(startDate,"YYYY-MM-DD  HH:mm:ss")
    var end = moment(endDate,"YYYY-MM-DD  HH:mm:ss").add(1, 'days')
    
    var receipts = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]}).populate('user','name').sort({ receipt_number: "desc" });

      let totalSales = receipts.filter(itm => itm.receipt_type == "SALE").length
      let totalRefunds = receipts.filter(itm => itm.receipt_type == "REFUND").length
      let totalReceipts = parseInt(totalSales) + parseInt(totalRefunds);

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
    const { account } = req.authData;
    
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
                TotalNetSale = parseFloat(TotalNetSale)+parseFloat(sale.total_price)
                TotalDiscounts = parseFloat(TotalDiscounts)+parseFloat(sale.total_discount)
                CostOfGoods = parseFloat(CostOfGoods)+parseFloat(sale.cost_of_goods)
                TotalGrossSales = parseFloat(TotalGrossSales)+parseFloat(sale.sub_total)
                TotalItemsSold++
              } else if(sale.receipt_type == "REFUND"){
                TotalRefunds = parseFloat(TotalRefunds)+parseFloat(sale.total_price)
                TotalDiscounts = parseFloat(TotalDiscounts)-parseFloat(sale.total_discount)
                CostOfGoods = parseFloat(CostOfGoods)-parseFloat(sale.cost_of_goods)
                TotalItemsRefunded++
              }
          }
          TotalNetSale = parseFloat(TotalGrossSales) - parseFloat(TotalDiscounts) - parseFloat(TotalRefunds)
          TotalGrossProfit = parseFloat(TotalNetSale) - parseFloat(CostOfGoods)
          TotalMargin = (( ( parseFloat(TotalNetSale) - (CostOfGoods) ) / parseFloat(TotalNetSale) ) * 100).toFixed(2);

          let SalesTotal = {
            GrossSales: parseFloat(TotalGrossSales).toFixed(2),
            Refunds: parseFloat(TotalRefunds).toFixed(2),
            discounts: parseFloat(TotalDiscounts).toFixed(2),
            NetSales: parseFloat(TotalNetSale).toFixed(2),
            CostOfGoods: parseFloat(CostOfGoods).toFixed(2),
            GrossProfit: parseFloat(TotalGrossProfit).toFixed(2),
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
    const { account } = req.authData;
    
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

        let quantitySold = 0;
        let grossSales = 0;
        let refundQuantitySold = 0;
        let refundGrossSales = 0;
        
        if(sales.length > 0) {
          await sales.map(async sale => { 
            await sale.items.map(async item => {
              await item.modifiers.map(async mod => {
                
                if(mod.modifier._id == modifier._id){
                  if(sale.receipt_type == "SALE"){
                    quantitySold = quantitySold + parseInt(item.quantity) * mod.options.length
                    grossSales = grossSales + item.total_modifiers
                  } else if(sale.receipt_type == "REFUND"){
                    refundQuantitySold = refundQuantitySold + parseInt(item.quantity) * mod.options.length
                    refundGrossSales = refundGrossSales + item.total_modifiers
                  }
                }
              })
            })
          })

          for(const option of modifier.options){
            let optQuantitySold = 0;
            let optGrossSales = 0;
            let optRefundQuantitySold = 0;
            let optRefundGrossSales = 0;
            let check = false
            await sales.map(async sale => { 
              await sale.items.map(async item => {
                await item.modifiers.map(async mod => {
                  await mod.options.map(opt => {
                    if(option.name == opt.option_name && opt.isChecked){
                      check = true
                      if(sale.receipt_type == "SALE"){
                        optQuantitySold = optQuantitySold + parseInt(item.quantity)
                        optGrossSales = optGrossSales + parseFloat(opt.price).toFixed(2)
                      } else if(sale.receipt_type == "REFUND"){
                        optRefundQuantitySold = optRefundQuantitySold + parseInt(item.quantity)
                        optRefundGrossSales = optRefundGrossSales + parseFloat(opt.price).toFixed(2)
                      }
                    }
                  })
                })
              })
            })
            if(check){
              optionsDetails.push({
                Option: option.name,
                quantitySold: optQuantitySold,
                grossSales: parseFloat(optGrossSales).toFixed(2),
                refundQuantitySold: optRefundQuantitySold,
                refundGrossSales: parseFloat(optRefundGrossSales).toFixed(2)
              })
            }
          }
          if(optionsDetails.length > 0){
            let salesTotal = {
              Modifier: modifier.title,
              quantitySold: quantitySold,
              grossSales: grossSales,
              refundQuantitySold: refundQuantitySold,
              refundGrossSales: refundGrossSales,
              options: optionsDetails
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
    const { account } = req.authData;
    
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
          total: parseFloat(sumBy(itemGroupDiscounts[key], 'discount_total')).toFixed(2)
        })
      }
      for(const key of receiptDiscountKeys){
        reportData.push({
          _id: key,
          title: receiptGroupDiscounts[key][0].title,
          applied: receiptGroupDiscounts[key].length,
          type: receiptGroupDiscounts[key][0].type,
          value: receiptGroupDiscounts[key][0].value,
          total: parseFloat(sumBy(receiptGroupDiscounts[key], 'value')).toFixed(2)
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
    const { account } = req.authData;
    
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
        taxableSale: parseFloat(itemGroupTaxes[key][0].taxableSale).toFixed(2),
        taxAmount: parseFloat(sumBy(itemGroupTaxes[key], 'tax_total')).toFixed(2)
      })
     }
     taxableSales = taxableSales.toFixed(2)
     NonTaxableSales = NonTaxableSales.toFixed(2)
     NetSales = NetSales.toFixed(2)
      
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
    const { account } = req.authData;
    
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
        taxableSale: parseFloat(itemGroupTaxes[key][0].taxableSale).toFixed(2),
        taxAmount: parseFloat(sumBy(itemGroupTaxes[key], 'tax_total')).toFixed(2)
      })
     }
     taxableSales = taxableSales.toFixed(2)
     NonTaxableSales = NonTaxableSales.toFixed(2)
     NetSales = NetSales.toFixed(2)
      
      res.status(200).json({reportData, taxableSales,
        NonTaxableSales,
        NetSales})
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})


module.exports = router;
