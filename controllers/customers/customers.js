import express from "express";
import Customers from "../../modals/customers/customers";
const ObjectId = require('mongoose').Types.ObjectId;
const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    var result = await Customers.find().sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/:name', async (req, res) => {

  try {
    const { name } = req.params;
    var result = await Customers.find({name: name});
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    console.log(id)
    if(ObjectId.isValid(id)){
      let result = await Customers.deleteOne({ _id: id });
      res.status(200).json({ message: "deleted", result });
    } else {
      res.status(400).json({ message: "Invalid ID" }); 
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/', async (req, res) => {
    const {name, email, phone, address, city, region, postal_code, country, note } = req.body;
    var errors = [];
    if (
        (!name ||
        typeof name == "undefined" ||
        name == "") &&
        (!email ||
          typeof email == "undefined" ||
          email == "") && 
          (!phone ||
            typeof phone == "undefined" ||
            phone == "")
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
              name: name,
              email: email,
              phone: phone,
              address: address,
              city: city,
              region: region,
              postal_code: postal_code,
              country: country,
              note: note,
              created_by: _id
            }).save();
            res.status(200).json(newCustomer);

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
});
router.patch('/', async (req, res) => {
  const { id, name, email, phone, address, city, region, postal_code, country, note } = req.body;
  var errors = [];
  if (
    (!name ||
    typeof name == "undefined" ||
    name == "") &&
    (!email ||
      typeof email == "undefined" ||
      email == "") && 
      (!phone ||
        typeof phone == "undefined" ||
        phone == "")
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
              name: name,
              email: email,
              phone: phone,
              address: address,
              city: city,
              region: region,
              postal_code: postal_code,
              country: country,
              note: note,
              created_by: _id
          };
            let result = await Customers.updateOne(
              { _id: id },
              data
            );
            res.status(200).json(result);

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
});

module.exports = router;