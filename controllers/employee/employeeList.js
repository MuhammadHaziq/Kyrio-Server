import express from "express";
import EmployeeLists from "../../modals/employee/employeeList";
import Users from "../../modals/users";
import Accounts from "../../modals/accounts";
import Role from "../../modals/role";
import {
  removeSpaces,
  removeNumberSpaces,
} from "../../function/validateFunctions";
import md5 from "md5";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const { accountId } = req.authData;
    var result = await Users.find({ accountId: accountId }).sort({
      _id: "desc",
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get_store_employee_list", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const { storeId } = req.query;
    let filter = "";
    if (storeId === undefined || storeId === "" || storeId === "0") {
      filter = { accountId: accountId };
    } else {
      filter = {
        accountId: accountId,
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
    const { accountId } = req.authData;
    // email: { $regex: ".*" + search + ".*", $options: "i" },
    let filter = "";
    if (storeId === "0" || storeId === undefined || storeId === "") {
      filter = {
        accountId: accountId,
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
            accountId: accountId,
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
    const { _id, accountId } = req.authData;

    let role = JSON.parse(roles)
    try {
      
      if(role.name !== "Owner") {
        let user = await Users.findOne({ email: email });
        if(!user){
            let users = new Users({
              name: removeSpaces(name),
              accountId: accountId,
              phone: removeSpaces(phone),
              email: email,
              emailVerified: false,
              role_id: role.id,
              role: role,
              stores: JSON.parse(stores),
              sendMail: (sendMail),
              posPin: posPin,
              created_by: _id,
            });
            users
              .save()
              .then(async (result) => {
                res.status(200).json(result);
              }).catch(error=>{
                res.status(400).json({ message: error.message });
              })
        } else {
          res.status(400).json({ message: "Employee already exist with this email" });
        }
      } else {
        res.status(400).json({ message: "Cannot create 2nd Owner of the store" });
      }
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
      let user = {
        name: removeSpaces(name),
        email: removeSpaces(email),
        phone: removeSpaces(phone),
        role: JSON.parse(roles),
        stores: JSON.parse(stores),
        sendMail: (sendMail),
        posPin: posPin,
        created_by: _id,
      };
      // let data = {
      //   name: removeSpaces(name),
      //   email: removeSpaces(email),
      //   phone: removeSpaces(phone),
      //   role: JSON.parse(roles),
      //   stores: JSON.parse(stores),
      //   sendMail: (sendMail),
      //   posPin: md5(posPin),
      //   created_by: _id,
      // };
      let result = await Users.findOneAndUpdate({ _id: id }, user, {
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
