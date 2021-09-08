import express from "express";
import PrinterModal from "../../modals/printers/modal";

const router = express.Router();

// Get list
router.get("/", async (req, res) => {
    try {
        const { account } = req.authData;
        const result = await PrinterModal.find({ account: account }).sort({ title: "asc" });
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
})
// Get Single Detail By ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { account } = req.authData;
    try {
        const result = await PrinterModal.find({ account: account, _id: id }).sort({ title: "asc" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
// Create Modal
router.post("/", async (req, res) => {
    const { title, Interfaces, page_width, is_enabled } = req.body;
    const { _id, account } = req.authData;
    var errors = [];
    if (!title || typeof title == "undefined" || title == "") {
        errors.push(`Invalid Title!`);
    }
    if (errors.length > 0) {
        res.status(400).send({ message: `Invalid Parameters!`, errors });
    } else {
        try {
            const newPrinterModal = new PrinterModal({
                title: title,
                Interfaces: Interfaces,
                page_width: page_width,
                is_enabled: is_enabled,
                createdBy: _id,
                account: account,
            });
            
            const insertedRecord = await newPrinterModal.save();
            res.status(200).json(insertedRecord);
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ message: "Modal name already exist" });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

})
// Update Printer Modal
router.patch("/", async (req, res) => {
    const { id, title, Interfaces, page_width, is_enabled } = req.body;
    const { _id } = req.authData;
    var errors = [];
    if (!title || typeof title == "undefined" || title == "") {
        errors.push(`Invalid Title!`);
    }
    if (errors.length > 0) {
        res.status(400).send({ message: `Invalid Parameters!`, errors });
    } else {
        try {
            const updatedRecord = await PrinterModal.findOneAndUpdate(
                    { _id: id },
                    {
                    $set: {
                        title: title,
                        Interfaces: Interfaces,
                        page_width: page_width,
                        is_enabled: is_enabled,
                        updatedBy: _id
                    },
                    },
                    {
                    new: true,
                    upsert: true, // Make this update into an upsert
                }
            )
            res.status(200).json(updatedRecord);
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ message: "Modal name already exist" });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
})
// Delete Modal
router.delete("/", async (req, res) => {
    try {
        var { id } = req.body;
        const { account } = req.authData;
        await PrinterModal.deleteOne({ _id: id, account: account });
        res.status(200).json({ message: "deleted" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }

})

module.exports = router;