import express from "express";
import Role from "../../modals/role";
import Users from "../../modals/users";
import Modules from "../../modals/modules";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { accountId } = req.authData;
    let accessRights = [];
    var roles = await Role.find({ accountId: accountId }).select(["_id","roleName", "allowBackoffice.enable", "allowPOS.enable"]).sort({
      _id: "desc",
    });
    for(const role of roles) {
      let access = role.allowBackoffice.enable && role.allowPOS.enable ? "Back office and POS" : role.allowBackoffice.enable && !role.allowPOS.enable ? "Back office" : !role.allowBackoffice.enable && role.allowPOS.enable ? "POS" : "";

      let NoOfEmployees = await Users.find({ role_id: role._id }).countDocuments();
      accessRights.push({
        role_id: role._id,
        roleName: role.roleName,
        access: access,
        NoOfEmployees: NoOfEmployees
      })
    }
    res.status(200).json(accessRights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/modules", async (req, res) => {
  try {
    const { accountId } = req.authData;
    let modules = await Modules.findOne();
    let data = {
    backoffice: modules.backofficeModules.map((itm) => {
        return {
          moduleId: itm._id,
          moduleName: itm.moduleName,
          description: typeof itm.description !== "undefined" ? itm.description : "",
        };
    }),
    pos: modules.posModules.map((itm) => {
      return {
        moduleId: itm._id,
        moduleName: itm.moduleName,
        description: typeof itm.description !== "undefined" ? itm.description : "",
      };
    }),
  }
   
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, backoffice, pos } = req.body;
    const { accountId } = req.authData;
    let modules = await Modules.findOne();
    let data = {
    backoffice: modules.backofficeModules.map((itm) => {
        return {
          moduleId: itm._id,
          moduleName: itm.moduleName,
          description: typeof itm.description !== "undefined" ? itm.description : "",
          isMenu: itm.isMenu,
          isChild: itm.isChild,
          enable: true,
        };
    }),
    pos: modules.posModules.map((itm) => {
      return {
        moduleId: itm._id,
        moduleName: itm.moduleName,
        enable: true,
        description: typeof itm.description !== "undefined" ? itm.description : "",
      };
    }),
  }
   
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
