import express from "express";
import Shifts from "../../modals/employee/shifts";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.get("/:shiftid", async (req, res) => {
  try {
    const { shiftid } = req.params;
    const { account } = req.authData;
    var errors = [];
    if (!shiftid || typeof shiftid == "undefined" || shiftid == "") {
      errors.push({ shiftid: `Invalid Shift ID!` });
    }
    if (errors.length > 0) {
      res.status(400).send({ message: `Invalid Parameters!`, errors });
    } else {
      var shift = await Shifts.findOne({ _id: shiftid, account: account });
      if (shift) {
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
    const { account } = req.authData;
    var shift = await Shifts.find({ account: account }).sort({
      _id: "desc",
    });
    res.status(200).json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      store,
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
    } = req.body;
    const { account, _id } = req.authData;
    var errors = [];
    if (
      typeof store == "undefined" ||
      store == "" ||
      store == null ||
      (store == {} &&
        Object.keys(store).length !== 0 &&
        store.constructor === Object)
    ) {
      errors.push({ store: `Invalid store!` });
    }
    if (
      !pos_device_id ||
      typeof pos_device_id == "undefined" ||
      pos_device_id == "" ||
      pos_device_id == null
    ) {
      errors.push({ pos_device_id: `Invalid pos_device_id!` });
    }
    if (errors.length > 0) {
      res.status(400).send({ message: `Invalid Parameters!`, errors });
    } else {
      let shift = new Shifts({
        store,
        pos_device_id,
        opened_at,
        closed_at,
        opened_by_employee: _id,
        closed_by_employee: _id,
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
        account: account,
        createdBy: _id,
      });
      shift
        .save()
        .then((insert) => {
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
    const {
      _id,
      store,
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
    } = req.body;
    const { account } = req.authData;
    var errors = [];
    if (!_id || typeof _id == "undefined" || _id == "" || _id == null) {
      errors.push({ _id: `Invalid _id!` });
    }
    if (
      typeof store == "undefined" ||
      store == "" ||
      store == null ||
      (store == {} &&
        Object.keys(store).length !== 0 &&
        store.constructor === Object)
    ) {
      errors.push({ store: `Invalid store!` });
    }
    if (
      !pos_device_id ||
      typeof pos_device_id == "undefined" ||
      pos_device_id == "" ||
      pos_device_id == null
    ) {
      errors.push({ pos_device_id: `Invalid pos_device_id!` });
    }
    if (errors.length > 0) {
      res.status(400).send({ message: `Invalid Parameters!`, errors });
    } else {
      var alreadyExist = await Shifts.findOne({ _id: _id, account: account });
      if (alreadyExist) {
        let updated = await Shifts.findOneAndUpdate(
          { _id: _id },
          {
            store,
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
            account: account,
          },
          {
            new: true,
            upsert: true, // Make this update into an upsert
          }
        );
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
    const { store, pos_device_id, opened_at, starting_cash, actual_cash } =
      req.body;
    const { account, _id } = req.authData;
    var errors = [];
    if (
      typeof store == "undefined" ||
      store == "" ||
      store == null ||
      (store == {} &&
        Object.keys(store).length !== 0 &&
        store.constructor === Object)
    ) {
      errors.push({ store: `Invalid store!` });
    }
    if (
      !pos_device_id ||
      typeof pos_device_id == "undefined" ||
      pos_device_id == "" ||
      pos_device_id == null
    ) {
      errors.push({ pos_device_id: `Invalid pos_device_id!` });
    }
    if (errors.length > 0) {
      res.status(400).send({ message: `Invalid Parameters!`, errors });
    } else {
      var openShift = await Shifts.findOne({
        pos_device_id: pos_device_id,
        closed_at: null,
        account: account,
      });

      if (!openShift) {
        let shift = new Shifts({
          store,
          pos_device_id,
          opened_at,
          opened_by_employee: _id,
          starting_cash,
          actual_cash,
          account: account,
          createdBy: _id,
        });
        shift
          .save()
          .then((insert) => {
            let shift = {
              _id: insert._id,
              store: insert.store,
              pos_device_id: insert.pos_device_id,
              opened_at: insert.opened_at,
              opened_by_employee: insert.opened_by_employee,
              starting_cash: insert.starting_cash,
              actual_cash: insert.actual_cash,
              account: insert.account,
              createdBy: insert.createdBy,
              taxes: insert.taxes,
              payments: insert.payments,
              message: "",
              alreadyOpen: false,
            };
            res.status(200).json(shift);
          })
          .catch((err) => {
            res.status(403).send({
              message: `Unable to Save Shift ${err.message}`,
            });
          });
      } else {
        let shift = {
          createdAt:
            typeof openShift.createdAt !== "undefined"
              ? openShift.createdAt
              : "",
          updatedAt:
            typeof openShift.updatedAt !== "undefined"
              ? openShift.updatedAt
              : "",
          _id: typeof openShift._id !== "undefined" ? openShift._id : "",
          store: typeof openShift.store !== "undefined" ? openShift.store : {},
          pos_device_id:
            typeof openShift.pos_device_id !== "undefined"
              ? openShift.pos_device_id
              : "",
          opened_at:
            typeof openShift.opened_at !== "undefined"
              ? openShift.opened_at
              : "",
          closed_at:
            typeof openShift.closed_at !== "undefined"
              ? openShift.closed_at
              : "",
          opened_by_employee:
            typeof openShift.opened_by_employee !== "undefined"
              ? openShift.opened_by_employee
              : "",
          closed_by_employee:
            typeof openShift.closed_by_employee !== "undefined"
              ? openShift.closed_by_employee
              : "",
          starting_cash:
            typeof openShift.starting_cash !== "undefined"
              ? openShift.starting_cash
              : 0,
          cash_payments:
            typeof openShift.cash_payments !== "undefined"
              ? openShift.cash_payments
              : 0,
          cash_refunds:
            typeof openShift.cash_refunds !== "undefined"
              ? openShift.cash_refunds
              : 0,
          paid_in:
            typeof openShift.paid_in !== "undefined" ? openShift.paid_in : 0,
          paid_out:
            typeof openShift.paid_out !== "undefined" ? openShift.paid_out : 0,
          expected_cash:
            typeof openShift.expected_cash !== "undefined"
              ? openShift.expected_cash
              : 0,
          actual_cash:
            typeof openShift.actual_cash !== "undefined"
              ? openShift.actual_cash
              : 0,
          gross_sales:
            typeof openShift.gross_sales !== "undefined"
              ? openShift.gross_sales
              : 0,
          refunds:
            typeof openShift.refunds !== "undefined" ? openShift.refunds : 0,
          discounts:
            typeof openShift.discounts !== "undefined"
              ? openShift.discounts
              : 0,
          net_sales:
            typeof openShift.net_sales !== "undefined"
              ? openShift.net_sales
              : 0,
          tip: typeof openShift.tip !== "undefined" ? openShift.tip : 0,
          surcharge:
            typeof openShift.surcharge !== "undefined"
              ? openShift.surcharge
              : 0,
          taxes: typeof openShift.taxes !== "undefined" ? openShift.taxes : [],
          payments:
            typeof openShift.payments !== "undefined" ? openShift.payments : [],
          account:
            typeof openShift.account !== "undefined" ? openShift.account : "",
          createdBy:
            typeof openShift.createdBy !== "undefined"
              ? openShift.createdBy
              : "",
        };
        res.status(201).send(shift);
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/close", async (req, res) => {
  try {
    const {
      _id,
      closed_at,
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
    } = req.body;
    const { account } = req.authData;
    var errors = [];
    if (!_id || typeof _id == "undefined" || _id == "" || _id == null) {
      errors.push({ _id: `Invalid _id!` });
    }
    if (errors.length > 0) {
      res.status(400).send({ message: `Invalid Parameters!`, errors });
    } else {
      var alreadyExist = await Shifts.findOne({ _id: _id, account: account });
      if (alreadyExist) {
        let updated = await Shifts.findOneAndUpdate(
          { _id: _id },
          {
            closed_at,
            closed_by_employee: req.authData._id,
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
            account,
          }
        );
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
