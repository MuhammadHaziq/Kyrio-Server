import express from "express";
import EmployeeLists from "../../modals/employee/employeeList";
import {
  removeSpaces,
  removeNumberSpaces,
} from "../../function/validateFunctions";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    var result = await EmployeeLists.find({ created_by: _id }).sort({
      _id: "desc",
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get_store_employee_list", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { storeId } = req.query;
    let filter = "";
    if (storeId === undefined || storeId === "" || storeId === "0") {
      filter = { created_by: _id };
    } else {
      filter = {
        created_by: _id,
        stores: {
          $elemMatch: {
            id: storeId,
          },
        },
      };
    }
    var result = await EmployeeLists.find(filter).sort({
      _id: "desc",
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { search, storeId } = req.query;
    // email: { $regex: ".*" + search + ".*", $options: "i" },
    let filter = "";
    if (storeId === "0" || storeId === undefined || storeId === "") {
      filter = {
        $or: [
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
          { email: { $regex: ".*" + search + ".*", $options: "i" } },
          { phone: { $regex: ".*" + search + ".*", $options: "i" } },
          {
            role: {
              "role.name": { $regex: ".*" + search + ".*", $options: "i" },
            },
          },
        ],
      };
    } else {
      filter = {
        $or: [
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
          { email: { $regex: ".*" + search + ".*", $options: "i" } },
          { phone: { $regex: ".*" + search + ".*", $options: "i" } },
          {
            role: {
              "role.name": { $regex: ".*" + search + ".*", $options: "i" },
            },
          },
        ],
        $and: [
          {
            stores: {
              $elemMatch: {
                id: storeId,
              },
            },
          },
        ],
      };
    }
    var result = await EmployeeLists.find(filter);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:ids", async (req, res) => {
  try {
    var { ids } = req.params;
    ids = JSON.parse(ids);
    ids.forEach(async (id) => {
      if (ObjectId.isValid(id)) {
        await EmployeeLists.deleteOne({ _id: id });
      }
    });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/", async (req, res) => {
  const { name, email, phone, roles, stores } = req.body;
  let { posPin, sendMail } = req.body
  var errors = [];
  if (
    (!name || typeof name == "undefined" || name == "") &&
    (!email || typeof email == "undefined" || email == "") &&
    (!phone || typeof phone == "undefined" || phone == "")
  ) {
    errors.push({ name: `Invalid Employee Name!` });
    errors.push({ email: `Invalid Employee Email!` });
    errors.push({ phone: `Invalid Employee phone!` });
  }
  if (posPin !== undefined && posPin === '0000' && posPin === '000' && posPin === '00' && posPin === '0') {
    errors.push({ posPin: `Please Enter Pos Pin!` });
  }
  if (sendMail === undefined) {
    sendMail = false
  }
  if (posPin === undefined) {
    posBin = '0000'
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id } = req.authData;


    try {
      const newEmployee = await new EmployeeLists({
        name: removeSpaces(name),
        email: removeSpaces(email),
        phone: removeSpaces(phone),
        role: JSON.parse(roles),
        stores: JSON.parse(stores),
        sendMail: (sendMail),
        posPin: posPin,
        created_by: _id,
      }).save();
      res.status(200).json(newEmployee);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: "Employee Email Already Exist" });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
});
router.patch("/", async (req, res) => {
  const { id, name, email, phone, roles, stores } = req.body;
  let { posPin, sendMail } = req.body
  var errors = [];
  if (
    (!name || typeof name == "undefined" || name == "") &&
    (!email || typeof email == "undefined" || email == "") &&
    (!phone || typeof phone == "undefined" || phone == "")
  ) {
    errors.push({ name: `Invalid Employee Name!` });
    errors.push({ email: `Invalid Employee Email!` });
    errors.push({ phone: `Invalid Employee phone!` });
  }
  if (posPin !== undefined && posPin === '0000' && posPin === '000' && posPin === '00' && posPin === '0') {
    errors.push({ posPin: `Please Enter Pos Pin!` });
  }
  if (sendMail === undefined) {
    sendMail = false
  }
  if (posPin === undefined) {
    posPin = '0000'
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
        role: JSON.parse(roles),
        stores: JSON.parse(stores),
        sendMail: (sendMail),
        posPin: posPin,
        created_by: _id,
      };
      let result = await EmployeeLists.findOneAndUpdate({ _id: id }, data, {
        new: true,
        upsert: true, // Make this update into an upsert
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
