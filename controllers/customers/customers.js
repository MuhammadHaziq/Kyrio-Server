import express from "express";
import Customers from "../../modals/customers/customers";
import {
  removeSpaces,
  removeNumberSpaces,
} from "../../function/validateFunctions";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const { accountId } = req.authData;
    var result = await Customers.find({ accountId: accountId }).sort({ name: 1 });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:search", async (req, res) => {
  try {
    const { search } = req.params;
    const { accountId } = req.authData;
    // email: { $regex: ".*" + search + ".*", $options: "i" },

    var result = await Customers.find({
      accountId: accountId,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).sort({ name: 1 });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    
    if (ObjectId.isValid(id)) {
      let result = await Customers.deleteOne({ _id: id });
      res.status(200).json({ message: "deleted", result });
    } else {
      res.status(400).json({ message: "Invalid ID" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/:ids", async (req, res) => {
  try {
    var { ids } = req.params;
    ids = JSON.parse(ids);
    ids.forEach(async (id) => {
      if (ObjectId.isValid(id)) {
        await Customers.deleteOne({ _id: id });
      }
    });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/", async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    city,
    region,
    postal_code,
    country,
    customer_code,
    note,
  } = req.body;
  var errors = [];
  if (
    (!name || typeof name == "undefined" || name == "") &&
    (!email || typeof email == "undefined" || email == "") &&
    (!phone || typeof phone == "undefined" || phone == "")
  ) {
    errors.push({ name: `Invalid Customer Name!` });
    errors.push({ email: `Invalid Customer Email!` });
    errors.push({ phone: `Invalid Customer phone!` });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id, accountId } = req.authData;
    try {
      let checkCustomer = await Customers.findOne({ accountId: accountId, email: email});
      if(checkCustomer && email !== ""){
        res.status(400).json({ message: "Customer with this email already exist" });
      } else{
        const newCustomer = await new Customers({
          name: removeSpaces(name),
          accountId: accountId,
          email: removeSpaces(email),
          phone: removeSpaces(phone),
          address: removeSpaces(address),
          city: removeSpaces(city),
          region: removeSpaces(region),
          postal_code: removeSpaces(postal_code),
          country: country,
          customer_code: removeSpaces(customer_code),
          note: removeSpaces(note),
          created_by: _id,
        }).save();
        res.status(200).json(newCustomer);
      }
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: "Customer with this email already exist" });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
});
router.patch("/", async (req, res) => {
  const {
    id,
    name,
    email,
    phone,
    address,
    city,
    region,
    postal_code,
    country,
    customer_code,
    note,
  } = req.body;
  var errors = [];
  if (
    (!name || typeof name == "undefined" || name == "") &&
    (!email || typeof email == "undefined" || email == "") &&
    (!phone || typeof phone == "undefined" || phone == "")
  ) {
    errors.push({ name: `Invalid Customer Name!` });
    errors.push({ email: `Invalid Customer Email!` });
    errors.push({ phone: `Invalid Customer phone!` });
  }

  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id } = req.authData;
    try {
      let data = {
        name: removeSpaces(name),
        email: removeSpaces(email),
        phone: removeSpaces(phone),
        address: removeSpaces(address),
        city: removeSpaces(city),
        region: removeSpaces(region),
        postal_code: removeSpaces(postal_code),
        country: country,
        customer_code: removeSpaces(customer_code),
        note: removeSpaces(note),
        created_by: _id,
      };
      let result = await Customers.findOneAndUpdate({ _id: id }, data, {
        new: true,
        upsert: true, // Make this update into an upsert
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

router.patch("/point_balance", async (req, res) => {
  const { _id, points_balance } = req.body;

  const { id } = req.authData;
  try {
    let data = {
      points_balance: removeNumberSpaces(points_balance),
      created_by: id,
    };
    let result = await Customers.updateOne({ _id: _id }, data);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
