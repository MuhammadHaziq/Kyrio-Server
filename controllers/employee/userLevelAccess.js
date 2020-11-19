import express from "express";
import Role from "../../modals/role";
import {
  removeSpaces,
  removeNumberSpaces,
} from "../../function/validateFunctions";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    var result = await Role.find({ user_id: _id }).sort({
      _id: "desc",
    });
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
        await Role.deleteOne({ _id: id });
      }
    });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  const {
    userId,
    accountId,
    features,
    allowBackoffice,
    allowPOS,
    settings,
  } = req.body;
  var errors = [];
  if (
    (!features || typeof features == "undefined" || features.lenght === 0) &&
    (!allowBackoffice ||
      typeof allowBackoffice == "undefined" ||
      allowBackoffice.lenght === 0) &&
    (!allowPOS || typeof allowPOS == "undefined" || allowPOS.lenght === 0) &&
    (!settings || typeof settings == "undefined" || settings.lenght === 0) &&
    (!userId || typeof userId == "undefined" || userId == "") &&
    (!accountId || typeof accountId == "undefined" || accountId == "")
  ) {
    errors.push({ features: `Employee Features Are Empty!` });
    errors.push({ allowBackoffice: `Employee Back Office Are Empty!` });
    errors.push({ allowPOS: `Employee POS Are Empty!` });
    errors.push({ settings: `Employee Settings Are Empty!` });
    errors.push({ userId: `Invalid User Id!` });
    errors.push({ accountId: `Invalid Account Id!` });
  }

  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id } = req.authData;
    try {
      const newRole = await new Role({
        roleName: removeSpaces(roleName),
        user_id: removeSpaces(userId),
        accountId: removeSpaces(accountId),
        features: JSON.parse(features),
        allowBackoffice: JSON.parse(allowBackoffice),
        allowPOS: JSON.parse(allowPOS),
        settings: JSON.parse(settings),
      }).save();
      res.status(200).json(newRole);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: "Role Name Already Exist" });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
});
router.patch("/", async (req, res) => {
  const {
    userId,
    accountId,
    features,
    allowBackoffice,
    allowPOS,
    settings,
  } = req.body;
  var errors = [];
  if (
    (!features || typeof features == "undefined" || features.lenght === 0) &&
    (!allowBackoffice ||
      typeof allowBackoffice == "undefined" ||
      allowBackoffice.lenght === 0) &&
    (!allowPOS || typeof allowPOS == "undefined" || allowPOS.lenght === 0) &&
    (!settings || typeof settings == "undefined" || settings.lenght === 0) &&
    (!userId || typeof userId == "undefined" || userId == "") &&
    (!accountId || typeof accountId == "undefined" || accountId == "")
  ) {
    errors.push({ features: `Employee Features Are Empty!` });
    errors.push({ allowBackoffice: `Employee Back Office Are Empty!` });
    errors.push({ allowPOS: `Employee POS Are Empty!` });
    errors.push({ settings: `Employee Settings Are Empty!` });
    errors.push({ userId: `Invalid User Id!` });
    errors.push({ accountId: `Invalid Account Id!` });
  }

  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id } = req.authData;
    try {
      let data = {
        features: JSON.parse(features),
        allowBackoffice: JSON.parse(allowBackoffice),
        allowPOS: JSON.parse(allowPOS),
        settings: JSON.parse(settings),
      };
      let result = await Role.findOneAndUpdate(
        { _id: id, user_id: userId, accountId: accountId },
        data,
        {
          new: true,
          upsert: true, // Make this update into an upsert
        }
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
