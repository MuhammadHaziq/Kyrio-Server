import express from "express";
import Customers from "../../modals/customers/customers";
const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    var result = await Customers.find().sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/:customer_name', async (req, res) => {

  try {
    const { customer_name } = req.query;
    var result = await Customers.find({name: customer_name});
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    let result = await Customers.deleteOne({ _id: id });

    res.status(200).json({ message: "deleted", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/', async (req, res) => {
    const {name, email, phone, address, city, region, postal_code, country, customer_code, note } = req.body;
    var errors = [];
    if (
        !name ||
        typeof name == "undefined" ||
        name == ""
      ) {
        errors.push({ name: `Invalid Customer Name!` });
      } else {
        errors = [];        
      }
     if (
        !email ||
        typeof email == "undefined" ||
        email == ""
      ) {
        errors.push({ email: `Invalid Customer Email!` });
      } else {
        errors = [];        
      }
    if (
        !phone ||
        typeof phone == "undefined" ||
        phone == ""
      ) {
        errors.push({ phone: `Invalid Customer phone!` });
      } else {
        errors = [];        
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
              customer_code: customer_code,
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
  const {name, email, phone, address, city, region, postal_code, country, customer_code, note } = req.body;
  var errors = [];
  if (
      !name ||
      typeof name == "undefined" ||
      name == ""
    ) {
      errors.push({ name: `Invalid Customer Name!` });
    } else {
      errors = [];        
    }
   if (
      !email ||
      typeof email == "undefined" ||
      email == ""
    ) {
      errors.push({ email: `Invalid Customer Email!` });
    } else {
      errors = [];        
    }
  if (
      !phone ||
      typeof phone == "undefined" ||
      phone == ""
    ) {
      errors.push({ phone: `Invalid Customer phone!` });
    } else {
      errors = [];        
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
              customer_code: customer_code,
              note: note,
              created_by: _id
          };
            let result = await Customers.updateOne(
              { name: name },
              data
            );
            res.status(200).json(result);

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
});

module.exports = router;