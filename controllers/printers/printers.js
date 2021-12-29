import express from "express";
import Printers from "../../modals/printers/printers";

const router = express.Router();

// Get list
router.get("/", async (req, res) => {
    try {
        const { account } = req.authData;
        const result = await Printers.find({ account: account }).populate('modal', ["_id","title"]).populate({ 
        path: 'groups', 
        select: ["_id" ]
    }).populate('store', ["_id","title"]).sort({ title: "asc" });
    let newResult = []
    for(const printer of result){
        let grps = [];
        for(const gr of printer.groups){
            grps.push(gr._id)
        }
        printer.groups = grps
        newResult.push(printer)
    }
        res.status(200).json(newResult);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
})
// Get Single Detail By ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { account } = req.authData;
    try {
        const result = await Printers.find({ account: account, _id: id }).populate('modal', ["_id","title"]).populate({ 
        path: 'groups', 
        select: ["_id","title"],
        populate : [{
            path: 'categories',
            select: ["_id","title","color"]
        }]
    }).populate('store', ["_id","title"]).sort({ title: "asc" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
// Get Single Detail By Store ID
router.get("/store/:storeId", async (req, res) => {
    const { storeId } = req.params;
    const { account } = req.authData;
    try {
        const result = await Printers.find({ account: account, store: storeId }).populate('modal', ["_id","title"]).populate({ 
        path: 'groups', 
        select: ["_id","title"],
        populate : [{
            path: 'categories',
            select: ["_id","title","color"]
        }]
    }).populate('store', ["_id","title"]).sort({ title: "asc" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
// Get Single Detail By Printer ID
router.get("/modal/:modalId", async (req, res) => {
    const { modalId } = req.params;
    const { account } = req.authData;
    try {
        const result = await Printers.find({ account: account, modal: modalId }).populate('modal', ["_id","title"]).populate({ 
        path: 'groups', 
        select: ["_id","title"],
        populate : [{
            path: 'categories',
            select: ["_id","title","color"]
        }]
    }).populate('store', ["_id","title"]).sort({ title: "asc" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
// Create Printer
router.post("/", async (req, res) => {
    try {
    const { 
        title,
        connect_interface,
        paper_width,
        address,
        PRNB,
        PO,
        APR,
        modal,
        groups,
        store } = req.body;
    const { _id, account } = req.authData;
    
        const newPrinter = new Printers({
            title: title,
            connect_interface: connect_interface,
            paper_width: paper_width,
            address: address,
            PRNB: PRNB,
            PO: PO,
            APR: APR,
            modal: modal,
            groups: groups,
            store: store,
            createdBy: _id,
            account: account,
        });
       
        const insertedRecord = await newPrinter.save();
        const result = await Printers.findOne({account: account, _id: insertedRecord._id}).populate('modal', ["_id","title"]).populate({ 
        path: 'groups', 
        select: ["_id","title"],
        populate : [{
            path: 'categories',
            select: ["_id","title","color"]
        }]
    }).populate('store', ["_id","title"])
        res.status(200).json(result);
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ message: "Printer name already exist" });
            } else {
                res.status(400).json({ message: error.message });
            }
        }

})
// Update Printer
router.patch("/", async (req, res) => {
    const { 
        id,
        title,
        connect_interface,
        paper_width,
        address,
        PRNB,
        PO,
        APR,
        modal,
        groups,
        store } = req.body;
    const { _id, account } = req.authData;
    
        try {
        const updatedRecord = await Printers.findOneAndUpdate(
            { _id: id },
            { $set: {
                title: title,
                connect_interface: connect_interface,
                paper_width: paper_width,
                address: address,
                PRNB: PRNB,
                PO: PO,
                APR: APR,
                modal: modal,
                groups: groups,
                store: store,
                createdBy: _id,
                account: account,
            }}).populate('modal', ["_id","title"]).populate({ 
                path: 'groups', 
                select: ["_id","title"],
                populate : [{
                    path: 'categories',
                    select: ["_id","title","color"]
                  }]
                }).populate('store', ["_id","title"])
        if(updatedRecord){
            res.status(200).json(updatedRecord);
        } else {
            res.status(400).json({ message: "Record Does not exist with this Object ID" });
        }
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ message: "Printer name already exist" });
            } else {
                res.status(400).json({ message: error.message });
            }
        }

})
// Delete Printer
router.delete("/", async (req, res) => {
    try {
        const { ids } = req.body;
        const { account } = req.authData;
        for (const _id of ids) {
            await Printers.deleteOne({ _id: _id, account: account });
        }
        res.status(200).json({ message: "deleted" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }

})

module.exports = router;