import express from "express";
import Role from "../../modals/role";
import Users from "../../modals/users";
import Modules from "../../modals/modules/modules";
import Backoffice from "../../modals/modules/backoffice";
import PosModule from "../../modals/modules/posModule";
import { ROLES_ACCESS_TOGGLE } from "../../sockets/events";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

/******* APIs which needs to be created within usercontroller********/
/*
  1- Get all roles with Access levels like Backoffice enabled/disabled and POS enbaled/disabled and also get total number of employees within the that role also Owner Role will only have 1 employee
  2- Get all modules to show them while creating new role
  3- Create New roles with Different Access rights
  4- Create employee with a specific role
*/
router.get("/get_roles_modules", async (req, res) => {
  try {
    var specificResult = [];
    specificResult.push({
      backofficeModules: { enable: false, modules: await Backoffice.find() },
      posModules: { enable: false, modules: await PosModule.find() },
    });
    res.status(200).send(specificResult);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:roleId", async (req, res) => {
  try {
    const { roleId } = req.params;
    const { account } = req.authData;
    var role = await Role.findOne({ account: account, _id: roleId }).populate('allowBackoffice.modules.backoffice', ["_id", "title", "handle", "isMenu", "isChild"]).populate('allowPOS.modules.posModule', ["_id", "title", "handle", "description"]);
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { account } = req.authData;
    let accessRights = [];
    var roles = await Role.find({ account: account, isDeleted: false })
      .select(["_id", "title", "allowBackoffice.enable", "allowPOS.enable"])
      .sort({
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
        role: role._id,
      }).countDocuments();
      accessRights.push({
        role_id: role._id,
        title: role.title,
        access: access,
        NoOfEmployees: NoOfEmployees,
        allowBackoffice: role.allowBackoffice.enable,
        allowPOS: role.allowPOS.enable,
      });
    }
    res.status(200).json(accessRights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get_role/:roleId", async (req, res) => {
  try {
    const { roleId } = req.params;
    const { account } = req.authData;
    let accessRights = [];
    var roles = await Role.find({
      account: account,
      _id: roleId,
      isDeleted: false,
    })
      .select(["_id", "title", "allowBackoffice.enable", "allowPOS.enable"])
      .sort({
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
        allowBackoffice: role.allowBackoffice.enable,
        allowPOS: role.allowPOS.enable,
      });
    }
    res.status(200).json(accessRights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const get_role_summary = async (roleId, account) => {
  try {
    let accessRights = [];
    var roles = await Role.find({
      account: account,
      _id: roleId,
      isDeleted: false,
    })
      .select(["_id", "title", "allowBackoffice.enable", "allowPOS.enable"])
      .sort({
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
        allowBackoffice: role.allowBackoffice.enable,
        allowPOS: role.allowPOS.enable,
      });
    }
    return { status: true, data: accessRights };
    // res.status(200).json(accessRights);
  } catch (error) {
    return { status: false, message: error.message };
    // res.status(500).json({ message: error.message });
  }
};
router.get("/modules/app", async (req, res) => {
  try {
    const { role_id, account } = req.authData;
    var role = await Role.findOne({ account: account, _id: role_id }).populate('allowPOS.modules.posModule', ["_id", "title", "handle"]);
    
    if (role.allowPOS.enable) {
      let modules = []
      for (const md of role.allowPOS.modules) {
        modules.push({
          _id: md.posModule._id,
          title: md.posModule.title,
          handle: md.posModule.handle,
          enable: md.enable
        })
      }

      res.status(200).json(modules);
    } else {
      res.status(400).json({ message: "Sorry you do not have access to POS!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, backoffice, pos } = req.body;
    const { account, _id } = req.authData;
    if (name == null || name == "") {
      res.status(422).send({
        message: `Role Name cannot be empty`,
      });
    } else {
      let role = await Role.find({ account: account, title: name });
      if (role.length > 0) {
        res.status(403).send({
          message: `${name} role already exist`,
        });
      } else {
        let data = {
          title: name,
          user_id: _id,
          account: account,
          isDeleted: false,
          allowBackoffice: {
            enable: backoffice.enable,
            modules: backoffice.modules.map((itm) => {
              return {
                backoffice: itm._id,
                enable: typeof itm.enable == "undefined" ? false : itm.enable,
              };
            }),
          },
          allowPOS: {
            enable: pos.enable,
            modules: pos.modules.map((itm) => {
              return {
                posModule: itm._id,
                enable: typeof itm.enable == "undefined" ? false : itm.enable,
              };
            }),
          },
        };
        let role = new Role(data);
        role
          .save()
          .then(async (insert) => {
            const response = await get_role_summary(insert._id, account);
            if (response.status == true) {
              res.status(200).json(response.data[0]);
            } else {
              res.status(500).json({ message: response.message });
            }
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
    const { account, _id } = req.authData;

    var roles = await Role.find({ _id: roleId })
      .select(["_id", "title", "allowBackoffice.enable", "allowPOS.enable"])
      .sort({
        _id: "desc",
      });
    if (roles !== undefined && roles !== null && roles.length > 0) {
      const id = roles !== undefined && roles !== null ? roles[0].roleId : "";
      const title =
        roles !== undefined && roles !== null ? roles[0].title : "";
      if (name.toUpperCase() == "OWNER" && title.toUpperCase() == "OWNER") {
        try {
          let data = {
            title: name,
            user_id: _id,
            account: account,
            allowBackoffice: {
              enable: backoffice.enable,
              modules: backoffice.modules.map((itm) => {
                return {
                  backoffice: itm.backoffice._id,
                  enable: itm.enable,
                };
              }),
            },
            allowPOS: {
              enable: pos.enable,
              modules: pos.modules.map((itm) => {
                return {
                  posModule: itm.posModule._id,
                  enable: itm.enable,
                };
              }),
            },
          };
          let updated = await Role.findOneAndUpdate({ _id: roleId }, data, {
            new: true,
            upsert: true, // Make this update into an upsert
          });
          const response = await get_role_summary(roleId, account);

          if (response.status == true) {
            res.status(200).json(response.data[0]);
          } else {
            res.status(500).json({ message: response.message });
          }
          // res.status(200).json(updated);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      } else if (
        name.toUpperCase() == "OWNER" &&
        title.toUpperCase() !== "OWNER"
      ) {
        res.status(422).send({
          message: `Role Already Exist`,
        });
      } else {
        try {
          let data = {
            title: name,
            user_id: _id,
            account: account,
            allowBackoffice: {
              enable: backoffice.enable,
              modules: backoffice.modules.map((itm) => {
                return {
                  backoffice: itm.backoffice._id,
                  enable: itm.enable,
                };
              }),
            },
            allowPOS: {
              enable: pos.enable,
              modules: pos.modules.map((itm) => {
                return {
                  posModule: itm.posModule._id,
                  enable: itm.enable,
                };
              }),
            },
          };
          let updatedRole = await Role.findOneAndUpdate({ _id: roleId }, data, {
            new: true,
            upsert: true, // Make this update into an upsert
          }).populate('allowBackoffice.modules.backoffice', ["_id", "title", "handle", "isMenu", "isChild"]).populate('allowPOS.modules.posModule', ["_id", "title", "handle", "description"]);
          if (updatedRole) {
            let appData = {
              modules: [],
              allowBackoffice: backoffice.enable,
              allowPOS: pos.enable
            }
            for (const md of updatedRole.allowPOS.modules) {
              appData.modules.push({
                _id: md.posModule._id,
                title: md.posModule.title,
                handle: md.posModule.handle,
                enable: md.enable
              })
            }
            
            req.io.to(account).emit(ROLES_ACCESS_TOGGLE, { app: appData, backoffice: updatedRole, user: _id, account: account });
          }
          const response = await get_role_summary(roleId, account);
          if (response.status == true) {
            res.status(200).json(response.data[0]);
          } else {
            res.status(500).json({ message: response.message });
          }
          // res.status(200).json(updated);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }
    } else {
      res.status(422).send({
        message: `Role Not Exist`,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.delete("/:ids", async (req, res) => {
  try {
    let { ids } = req.params;
    const { account } = req.authData;
    for (const id of JSON.parse(ids)) {
      var roles = await Role.findOne({ account: account, _id: id })
        .select([
          "_id",
          "title",
          "allowBackoffice.enable",
          "allowPOS.enable",
        ])
        .sort({
          _id: "desc",
        });
      let NoOfEmployees = await Users.find({
        role_id: roles._id,
      }).countDocuments();
      if (NoOfEmployees > 0) {
        res
          .status(500)
          .json({ message: `This Role Already Have ${NoOfEmployees}` });
      } else {
        let updated = await Role.findOneAndUpdate(
          { _id: id },
          { isDeleted: true }
        );
      }
    }
    res.status(200).json({ message: "Role Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
