import express from "express";
import Shifts from "../../modals/employee/shifts";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();


router.get("/:shiftid", async (req, res) => {
  try {
      
        const { shiftid } = req.params;
        const { accountId } = req.authData;
        var errors = [];
        if (!shiftid || typeof shiftid == "undefined" || shiftid == "") {
        errors.push({ shiftid: `Invalid Shift ID!` });
        }
        if (errors.length > 0) {
            res.status(400).send({ message: `Invalid Parameters!`, errors });
        } else {
            var shift = await Shifts.findOne({ _id: shiftid, accountId: accountId });
            if(shift){
                res.status(200).json(shift);
            } else {
                res.status(500).json({ message: "Shift does not exist" });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get("/", async (req, res) => {
  try {
    const { accountId } = req.authData;
    var shift = await Shifts.find({ accountId: accountId }).sort({
      _id: "desc",
    });
    res.status(200).json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { store,
        pos_device_id,
        opened_at,
        closed_at,
        opened_by_employee,
        closed_by_employee,
        starting_cash,
        cash_payments,
        cash_refunds,
        paid_in,
        paid_out,
        expected_cash,
        actual_cash,
        gross_sales,
        refunds,
        discounts,
        net_sales,
        tip,
        surcharge,
        taxes,
        payments,
        created_at } = req.body;
    const { accountId, _id } = req.authData;
    var errors = [];
    if ((typeof store == "undefined" || store == "" || store == null || store == {} && (Object.keys(store).length !== 0 && store.constructor === Object))) {
        errors.push({ store: `Invalid store!` });
    }
    if (!pos_device_id || typeof pos_device_id == "undefined" || pos_device_id == "" || pos_device_id == null) { 
        errors.push({ pos_device_id: `Invalid pos_device_id!` });
    }
    if (errors.length > 0) {
        res.status(400).send({ message: `Invalid Parameters!`, errors });
    } else {

    let shift = new Shifts({
        store, pos_device_id, opened_at, closed_at, opened_by_employee, closed_by_employee, starting_cash, cash_payments, cash_refunds, paid_in, paid_out, expected_cash, actual_cash, gross_sales, refunds, discounts, net_sales, tip, surcharge, taxes, payments, accountId:accountId, created_by: _id, created_at: created_at, updated_at: created_at
    });
    shift.save().then((insert) => {
          res.status(200).json(insert);
        })
        .catch((err) => {
          res.status(403).send({
            message: `Unable to Save Shift ${err.message}`,
          });
        });
      }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/", async (req, res) => {
    try {
        const { shift_id, store, pos_device_id, opened_at, closed_at, opened_by_employee, closed_by_employee, starting_cash, cash_payments, cash_refunds, paid_in, paid_out, expected_cash, actual_cash, gross_sales, refunds, discounts, net_sales, tip, surcharge, taxes, payments, updated_at } = req.body;
        const { accountId, _id } = req.authData;
        var errors = [];
        if (!shift_id || typeof shift_id == "undefined" || shift_id == "" || shift_id == null) { 
        errors.push({ shift_id: `Invalid shift_id!` });
        }
        if ((typeof store == "undefined" || store == "" || store == null || store == {} && (Object.keys(store).length !== 0 && store.constructor === Object))) {
            errors.push({ store: `Invalid store!` });
        }
        if (!pos_device_id || typeof pos_device_id == "undefined" || pos_device_id == "" || pos_device_id == null) { 
            errors.push({ pos_device_id: `Invalid pos_device_id!` });
        }
        if (errors.length > 0) {
            res.status(400).send({ message: `Invalid Parameters!`, errors });
        } else {
            var alreadyExist = await Shifts.findOne({ _id: shift_id, accountId: accountId });
            if(alreadyExist){
                let updated = await Shifts.findOneAndUpdate({ _id: shift_id }, {
                    store, pos_device_id, opened_at, closed_at, opened_by_employee, closed_by_employee, starting_cash, cash_payments, cash_refunds, paid_in, paid_out, expected_cash, actual_cash, gross_sales, refunds, discounts, net_sales, tip, surcharge, taxes, payments, accountId:accountId, updated_at: updated_at
                }, {
                new: true,
                upsert: true, // Make this update into an upsert
                });
                res.status(200).json(updated);
            } else {
                res.status(500).json({ message: "Shift does not exist" });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post("/open", async (req, res) => {
    try {
        const { store, pos_device_id, opened_at, opened_by_employee, starting_cash, actual_cash, created_at } = req.body;
        const { accountId, _id } = req.authData;
        var errors = [];
        if ((typeof store == "undefined" || store == "" || store == null || store == {} && (Object.keys(store).length !== 0 && store.constructor === Object))) {
            errors.push({ store: `Invalid store!` });
        }
        if (!pos_device_id || typeof pos_device_id == "undefined" || pos_device_id == "" || pos_device_id == null) { 
            errors.push({ pos_device_id: `Invalid pos_device_id!` });
        }
        if (errors.length > 0) {
            res.status(400).send({ message: `Invalid Parameters!`, errors });
        } else {
            var openShift = await Shifts.findOne({ pos_device_id: pos_device_id, closed_at: null, accountId: accountId });
            
            if(!openShift){
            let shift = new Shifts({
                store, pos_device_id, opened_at, opened_by_employee, starting_cash, actual_cash, created_at, accountId: accountId, created_by: _id, created_at: created_at, updated_at: created_at
            });
            shift.save().then((insert) => {
                    let shift = {
                        _id: insert._id,
                        created_at: insert.created_at,
                        updated_at: insert.updated_at,
                        store: insert.store,
                        pos_device_id: insert.pos_device_id,
                        opened_at: insert.opened_at,
                        opened_by_employee: insert.opened_by_employee,
                        starting_cash: insert.starting_cash,
                        actual_cash: insert.actual_cash,
                        accountId: insert.accountId,
                        created_by: insert.created_by,
                        taxes: insert.taxes,
                        payments: insert.payments,
                        message: '',
                        alreadyOpen: false
                    }
                  res.status(200).json(shift);
                })
                .catch((err) => {
                  res.status(403).send({
                    message: `Unable to Save Shift ${err.message}`,
                  });
                });
            } else {
                let shift = {
                    created_at: typeof openShift.created_at !== "undefined" ? openShift.created_at : '',
                    updated_at: typeof openShift.updated_at !== "undefined" ? openShift.updated_at : '',
                    _id: typeof openShift._id !== "undefined" ? openShift._id : '',
                    store: typeof openShift.store !== "undefined" ? openShift.store : {},
                    pos_device_id: typeof openShift.pos_device_id !== "undefined" ? openShift.pos_device_id : '',
                    opened_at: typeof openShift.opened_at !== "undefined" ? openShift.opened_at : '',
                    closed_at: typeof openShift.closed_at !== "undefined" ? openShift.closed_at : '',
                    opened_by_employee: typeof openShift.opened_by_employee !== "undefined" ? openShift.opened_by_employee : '',
                    closed_by_employee: typeof openShift.closed_by_employee !== "undefined" ? openShift.closed_by_employee : '',
                    starting_cash: typeof openShift.starting_cash !== "undefined" ? openShift.starting_cash : '',
                    cash_payments: typeof openShift.cash_payments !== "undefined" ? openShift.cash_payments : 0,
                    cash_refunds: typeof openShift.cash_refunds !== "undefined" ? openShift.cash_refunds : 0,
                    paid_in: typeof openShift.paid_in !== "undefined" ? openShift.paid_in : '',
                    paid_out: typeof openShift.paid_out !== "undefined" ? openShift.paid_out : '',
                    expected_cash: typeof openShift.expected_cash !== "undefined" ? openShift.expected_cash : 0,
                    actual_cash: typeof openShift.actual_cash !== "undefined" ? openShift.actual_cash : 0,
                    gross_sales: typeof openShift.gross_sales !== "undefined" ? openShift.gross_sales : 0,
                    refunds: typeof openShift.refunds !== "undefined" ? openShift.refunds : 0,
                    discounts: typeof openShift.discounts !== "undefined" ? openShift.discounts : 0,
                    net_sales: typeof openShift.net_sales !== "undefined" ? openShift.net_sales : 0,
                    tip: typeof openShift.tip !== "undefined" ? openShift.tip : 0,
                    surcharge: typeof openShift.surcharge !== "undefined" ? openShift.surcharge : 0,
                    taxes: typeof openShift.taxes !== "undefined" ? openShift.taxes : [],
                    payments: typeof openShift.payments !== "undefined" ? openShift.payments : [],
                    accountId: typeof openShift.accountId !== "undefined" ? openShift.accountId : '',
                    created_by: typeof openShift.created_by !== "undefined" ? openShift.created_by : '',
                }
                res.status(201).send(shift);
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch("/close", async (req, res) => {
    try {
        const { shift_id, closed_at, closed_by_employee, cash_payments, cash_refunds, paid_in, paid_out, expected_cash, actual_cash, gross_sales, refunds, discounts, net_sales, tip, surcharge, taxes, payments, updated_at } = req.body;
        const { accountId } = req.authData;
        var errors = [];
        if (!shift_id || typeof shift_id == "undefined" || shift_id == "" || shift_id == null) { 
            errors.push({ shift_id: `Invalid shift_id!` });
        }
        if (errors.length > 0) {
            res.status(400).send({ message: `Invalid Parameters!`, errors });
        } else {
            var alreadyExist = await Shifts.findOne({ _id: shift_id, accountId: accountId });
            if(alreadyExist){
                let updated = await Shifts.findOneAndUpdate({ _id: shift_id }, {
                    closed_at, closed_by_employee, cash_payments, cash_refunds, paid_in, paid_out, expected_cash, actual_cash, gross_sales, refunds, discounts, net_sales, tip, surcharge, taxes, payments, accountId, updated_at
                });
                    res.status(200).json(updated);
            } else {
                res.status(500).json({ message: "Shift does not exist" });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
