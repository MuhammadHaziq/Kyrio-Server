import express from "express";
import Role from "../../modals/role";
import Users from "../../modals/users";
import Modules from "../../modals/modules";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

/******* APIs which needs to be created within usercontroller********/ 
/*
  1- Get all roles with Access levels like Backoffice enabled/disabled and POS enbaled/disabled and also get total number of employees within the that role also Owner Role will only have 1 employee
  2- Get all modules to show them while creating new role
  3- Create New roles with Different Access rights
  4- Create employee with a specific role
*/


router.get("/:roleId", async (req, res) => {
  try {
    const { roleId } = req.params;
    const { accountId } = req.authData;
    var role = await Role.findOne({ accountId: accountId, _id: roleId });
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
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
    const { accountId, _id } = req.authData;
    if(name == null || name == ""){
      res.status(422).send({
        message: `Role Name cannot be empty`,
      });
    } else {
    let role = await Role.find({ roleName: name });
    if(role.length > 0){
      res.status(403).send({
        message: `${name} role already exist`,
      });
    } else {
    let data = {
      roleName: name,
      user_id: _id,
      accountId: accountId,
      features: [],
      allowBackoffice: {
        enable: backoffice.enable,
        modules: backoffice.modules.map(itm => {
          return {
            moduleId: itm.moduleId,
            moduleName: itm.moduleName,
            isMenu: itm.isMenu,
            isChild: itm.isChild,
            enable: itm.enable,
          };
        })
      },
      allowPOS: {
        enable: pos.enable,
        modules: pos.modules.map(itm => {
          return {
            moduleId: itm.moduleId,
            moduleName: itm.moduleName,
            enable: itm.enable,
          };
        })
      }
    }
    let role = new Role(data);
    role.save().then((insert) => {
          res.status(200).json(insert);
        })
        .catch((err) => {
          res.status(403).send({
            message: `Unable to Save Role ${err.message}`,
          });
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/update", async (req, res) => {
  try {
    const { roleId, name, backoffice, pos } = req.body;
    const { accountId, _id } = req.authData;

    let data = {
      roleName: name,
      user_id: _id,
      accountId: accountId,
      features: [],
      allowBackoffice: {
        enable: backoffice.enable,
        modules: backoffice.modules.map(itm => {
          return {
            moduleId: itm.moduleId,
            moduleName: itm.moduleName,
            isMenu: itm.isMenu,
            isChild: itm.isChild,
            enable: itm.enable,
          };
        })
      },
      allowPOS: {
        enable: pos.enable,
        modules: pos.modules.map(itm => {
          return {
            moduleId: itm.moduleId,
            moduleName: itm.moduleName,
            enable: itm.enable,
          };
        })
      }
    }
    let updated = await Role.findOneAndUpdate({ _id: roleId }, data, {
      new: true,
      upsert: true, // Make this update into an upsert
    });
    res.status(200).json(updated);
   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
