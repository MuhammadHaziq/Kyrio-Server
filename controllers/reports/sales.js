import express from "express";
import Sales from "../../modals/sales/sales";
import ItemList from "../../modals/items/ItemList";
import Users from "../../modals/users";
import _, { groupBy, orderBy, slice, isEmpty, sumBy } from 'lodash';
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

          TotalItemsSold = 0;
          TotalItemsRefunded = 0;
          for(const sale of sales){
            let found = sale.items.filter(itm => itm.id == item._id)
            if(found.length > 0){
              
              if(sale.receipt_type == "SALE"){
                TotalNetSale = parseFloat(TotalNetSale)+parseFloat(sumBy(found, 'total_price'))
                TotalDiscounts = parseFloat(TotalDiscounts)+parseFloat(sumBy(found, 'total_discount'))
                CostOfGoods = parseFloat(CostOfGoods)+parseFloat(sumBy(found, 'cost'))
                TotalGrossSales = parseFloat(TotalGrossSales)+parseFloat(sumBy(found, 'total_price'))
                TotalItemsSold = TotalItemsSold + parseInt(sumBy(found, 'quantity') - sumBy(found, 'refund_quantity'));
              } else if(sale.receipt_type == "REFUND"){
                TotalRefunds = parseFloat(TotalRefunds)+parseFloat(sumBy(found, 'total_price'))
                TotalDiscounts = parseFloat(TotalDiscounts)-parseFloat(sumBy(found, 'total_discount'))
                CostOfGoods = parseFloat(CostOfGoods)-parseFloat(sumBy(found, 'cost'))
                TotalItemsRefunded = TotalItemsRefunded + sumBy(found, 'quantity')
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
            taxes: 0,
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
        ]}).populate('category', ["_id","title"])
      
      let categories = await groupBy(itemsFound.map(itm =>{return typeof itm.category !== "undefined" && itm.category !== null ? itm.category.title : "No category" }));
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
          let category = typeof item.category !== "undefined" && typeof item.category.title !== "undefined" && item.category !== null ? item.category.title : "No category";
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
      ]}).populate('user','name');

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
    
    var receipts = await Sales.find({$and: [
      {"created_at": {$gte: start, $lte: end}},
      {account: account},
      { "store._id": { "$in" : stores} },
      { created_by: { "$in" : employees} },
      ]}).populate('user','name');

      // const paymentMethods = await groupBy(receipts.map(sale => sale.payment_method))
      // console.log(sumBy(sales, 'total_price'))
      let modifiers = []
      await receipts.map(sale => sale.items.map(item => item.modifiers.map(mod => modifiers.push(mod))))
      modifiers = await groupBy(modifiers,"modifier._id")
      let modifierKeys = Object.keys(modifiers)

      for(const mod of modifierKeys){
        
      }
      
      res.status(200).json({ modifierKeys, modifiers })
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})


module.exports = router;
