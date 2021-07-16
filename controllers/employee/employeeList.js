import express from "express";
import Users from "../../modals/users";
import { removeSpaces } from "../../function/validateFunctions";
import md5 from "md5";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { storeId } = req.body;

    const { account } = req.authData;
    let result;
    if (typeof storeId !== "undefined") {
      result = await Users.find({
        account: account,
        stores: { $in: storeId },
      }).populate('role',["_id","title"]).populate('stores', ["_id","title"]).sort({
        name: 1
      });
    } else {
      result = await Users.find({ account: account }).populate('role',["_id","title"]).populate('stores', ["_id","title"]).sort({
        name: 1
      });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get_store_employee_list/:storeId", async (req, res) => {
  try {
    const { account } = req.authData;
    const { storeId } = req.params;
    let filter = "";
    if (storeId === undefined || storeId === "" || storeId === "0") {
      filter = { account: account };
    } else {
      filter = {
        account: account,
        stores: { $in: storeId },
      };
    }
    var result = await Users.find(filter).populate('role',["_id","title"]).populate('stores', ["_id","title"]).sort({
      name: 1
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { search, storeId } = req.query;
    const { account } = req.authData;
    // email: { $regex: ".*" + search + ".*", $options: "i" },
    let filter = "";
    if (storeId === "0" || storeId === undefined || storeId === "") {
      filter = {
        account: account,
        $or: [
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
          { email: { $regex: ".*" + search + ".*", $options: "i" } },
          { phone: { $regex: ".*" + search + ".*", $options: "i" } },
          {
            role: {
              "role.title": { $regex: ".*" + search + ".*", $options: "i" },
            },
          },
        ],
      };
    } else {
      filter = {
        $or: [
          { title: { $regex: ".*" + search + ".*", $options: "i" } },
          { email: { $regex: ".*" + search + ".*", $options: "i" } },
          { phone: { $regex: ".*" + search + ".*", $options: "i" } },
          {
            role: {
              "role.title": { $regex: ".*" + search + ".*", $options: "i" },
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
            account: account,
          },
        ],
      };
    }
    var result = await Users.find(filter).sort({title: 1});
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
        await Users.deleteOne({ _id: id });
      }
    });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:ids", async (req, res) => {
  try {
    var { ids } = req.params;
    let result = [];
    if (ObjectId.isValid(ids)) {
      result = await Users.findOne({ _id: ids }).populate('role',["_id","title"]).populate('stores', ["_id","title"]);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  const { name, email, phone, role, stores, enablePin } = req.body;
  let { posPin, sendMail } = req.body;
  var errors = [];
  if (
    (!name || typeof name == "undefined" || name == "")
  ) {
    errors.push({ name: `Invalid Employee Name!` });
  }
  if (
    posPin !== undefined &&
    posPin === "0000" &&
    posPin === "000" &&
    posPin === "00" &&
    posPin === "0"
  ) {
    errors.push({ posPin: `Please Enter Pos Pin!` });
  }
  if (sendMail === undefined) {
    sendMail = false;
  }
  if (posPin === undefined) {
    posPin = "0000";
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id, account } = req.authData;

    try {
      if (role.title !== "Owner") {
        let user;
        if(email.trim())
        {
          user = await Users.findOne({ email: email });
        }
        
          if (!user) {
            let users = new Users({
              name: removeSpaces(name),
              account: account,
              phone: removeSpaces(phone),
              email: email,
              password: md5("123456"),
              emailVerified: false,
              sendMail: sendMail,
              posPin: posPin,
              enablePin: enablePin,
              role: role._id,
              stores: stores,
              createdBy: _id,
            });
            users
              .save()
              .then(async (result) => {
                let userRes = await Users.findOne({ _id: result._id }).populate('role',["_id","title"]).populate('stores', ["_id","title"]);
                res.status(200).json(userRes);
              })
              .catch((error) => {
                res.status(400).json({ message: error.message });
              });
          } else {
            res
              .status(400)
              .json({ message: "Employee already exist with this email" });
          }
      } else {
        res
          .status(400)
          .json({ message: "Cannot create 2nd Owner of the store" });
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
  const { id, name, email, phone, role, stores, enablePin } = req.body;
  
  let { posPin, sendMail } = req.body;
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
  if (
    posPin !== undefined &&
    posPin === "0000" &&
    posPin === "000" &&
    posPin === "00" &&
    posPin === "0"
  ) {
    errors.push({ posPin: `Please Enter Pos Pin!` });
  }
  if (sendMail === undefined) {
    sendMail = false;
  }
  if (posPin === undefined) {
    posPin = "0000";
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
        sendMail: sendMail,
        posPin: posPin,
        enablePin: enablePin,
        role: role._id,
        stores: stores,
        createdBy: _id,
      };
      let result = await Users.findOneAndUpdate({ _id: id }, user, {
        new: true,
        upsert: true, // Make this update into an upsert
      }).populate('role',["_id","title"]).populate('stores', ["_id","title"]);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
