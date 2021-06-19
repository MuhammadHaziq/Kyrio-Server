import express from "express";
import Role from "../../modals/role";
import Modules from "../../modals/modules/modules";
import Users from "../../modals/users";
import {
  removeSpaces,
  removeNumberSpaces,
} from "../../function/validateFunctions";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.get("/get_roles_modules", async (req, res) => {
  try {
    var result = await Modules.find();
    var specificResult = [];
    var backOffice = [];
    var posModules = [];
    (result || []).map((item) => {
      item.backofficeModules.map((back) => {
        backOffice.push({
          moduleId: back._id,
          moduleName: back.moduleName,
          description:
            typeof back.description !== "undefined" ? back.description : "",
        });
      });
      item.posModules.map((pos) => {
        posModules.push({
          moduleId: pos._id,
          moduleName: pos.moduleName,
          description:
            typeof pos.description !== "undefined" ? pos.description : "",
        });
      });
    });
    specificResult.push({
      backofficeModules: { enable: false, modules: backOffice },
      posModules: { enable: false, modules: posModules },
    });
    res.status(200).send(specificResult);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { account, _id } = req.authData;
    // var result = await Role.find({ user_id: _id }).sort({
    //   _id: "desc",
    // });
    let accessRights = [];

    var roles = await Role.find({ account: account }).sort({
      _id: "desc",
    });
    for (const role of roles) {
      let access =
        role.allowBackoffice.enable && role.allowPOS.enable
          ? "Back office and POS"
          : role.allowBackoffice.enable && !role.allowPOS.enable
          ? "Back office"
          : !role.allowBackoffice.enable && role.allowPOS.enable
          ? "POS"
          : "";

      let NoOfEmployees = await Users.find({
        role_id: role._id,
      }).countDocuments();
      accessRights.push({
        role_id: role._id,
        title: role.title,
        access: access,
        NoOfEmployees: NoOfEmployees,
        allowBackoffice: role.allowBackoffice,
        allowPOS: role.allowPOS,
      });
    }
    res.status(200).json(accessRights);
    // res.status(200).json(result);
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
  const { userId, features, allowBackoffice, allowPOS, settings } = req.body;
  var errors = [];
  if (
    (!features || typeof features == "undefined" || features.lenght === 0) &&
    (!allowBackoffice ||
      typeof allowBackoffice == "undefined" ||
      allowBackoffice.lenght === 0) &&
    (!allowPOS || typeof allowPOS == "undefined" || allowPOS.lenght === 0) &&
    (!settings || typeof settings == "undefined" || settings.lenght === 0) &&
    (!userId || typeof userId == "undefined" || userId == "") &&
    (!account || typeof account == "undefined" || account == "")
  ) {
    errors.push({ features: `Employee Features Are Empty!` });
    errors.push({ allowBackoffice: `Employee Back Office Are Empty!` });
    errors.push({ allowPOS: `Employee POS Are Empty!` });
    errors.push({ settings: `Employee Settings Are Empty!` });
    errors.push({ userId: `Invalid User Id!` });
    errors.push({ account: `Invalid Account Id!` });
  }

  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { account } = req.authData;
    try {
      const newRole = await new Role({
        title: removeSpaces(title),
        user_id: removeSpaces(userId),
        account: account,
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
  const { userId, features, allowBackoffice, allowPOS, settings } = req.body;
  var errors = [];
  if (
    (!features || typeof features == "undefined" || features.lenght === 0) &&
    (!allowBackoffice ||
      typeof allowBackoffice == "undefined" ||
      allowBackoffice.lenght === 0) &&
    (!allowPOS || typeof allowPOS == "undefined" || allowPOS.lenght === 0) &&
    (!settings || typeof settings == "undefined" || settings.lenght === 0) &&
    (!userId || typeof userId == "undefined" || userId == "") &&
    (!account || typeof account == "undefined" || account == "")
  ) {
    errors.push({ features: `Employee Features Are Empty!` });
    errors.push({ allowBackoffice: `Employee Back Office Are Empty!` });
    errors.push({ allowPOS: `Employee POS Are Empty!` });
    errors.push({ settings: `Employee Settings Are Empty!` });
    errors.push({ userId: `Invalid User Id!` });
    errors.push({ account: `Invalid Account Id!` });
  }

  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { account } = req.authData;
    try {
      let data = {
        features: JSON.parse(features),
        allowBackoffice: JSON.parse(allowBackoffice),
        allowPOS: JSON.parse(allowPOS),
        settings: JSON.parse(settings),
      };
      let result = await Role.findOneAndUpdate(
        { _id: id, user_id: userId, account: account },
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
