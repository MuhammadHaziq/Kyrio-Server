import express from "express";
import Customers from "../../modals/customers/customers";
import { removeSpaces } from "../../function/validateFunctions";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    var result = await Customers.find().sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:search", async (req, res) => {
  try {
    const { search } = req.params;
    // email: { $regex: ".*" + search + ".*", $options: "i" },

    var result = await Customers.find({
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    console.log(id);
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
    const { _id } = req.authData;
    try {
      const newCustomer = await new Customers({
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
      }).save();
      res.status(200).json(newCustomer);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: "Customer Email ALready Exist" });
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
      let result = await Customers.updateOne({ _id: id }, data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
