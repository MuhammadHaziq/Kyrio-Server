import Users from "../modals/users";
import Role from "../modals/role";
import Stores from "../modals/Store";
// import Accounts from "../modals/accounts";
import Sales from "../modals/sales/sales";
import PrinterModal from "../modals/printers/modal";
import UserTickets from "../modals/UserTickets";
import { checkModules, addModuleWhenSignUp } from "../libs/middlewares";
import md5 from "md5";
import express from "express";
import jwt from "jsonwebtoken";

import { printerModels } from "../data/Printers";
import { uuidv4, addMinutes } from "../function/globals";
import { sendEmail, sendPasswordResetEmail } from "../libs/sendEmail";
import { deleteUserAccount } from "../function/globals";

var router = express.Router();

router.post("/videoaskwebhook", async (req, res) => {
  console.log(req.body);
  res.status(200).send({message: "Received"});
})
router.post("/testapi", async (req, res) => {
  const { param } = req.body;
  let userResult = await Sales.aggregate([
    {"$match": {"account" :{ "$eq" : '628aeeb5dfb45b23782a7701' }, "store._id": "628aeeb5dfb45b23782a7716" } }, 
    {"$group" : {
      _id: {
        receipt_number: "$receipt_number"
      },
      uniqueIds: {
        $addToSet: "$_id"
      },
      count: {
        $sum: 1
      }
    } },
    {"$match": {"count" : {"$gt": 1} } },
    // {"$project": {"receipt_number" : "$_id", "_id" : 0} }
  ]);

  let totalDuplicates = 0;
  let keepIDs = [];
  let deleteIDs = [];
  for(const itm of userResult){
    let IDs = itm.uniqueIds
    keepIDs.push(IDs[0]);
    IDs.splice(0, 1);
    for(const id of IDs){
      deleteIDs.push(id)
    }
    totalDuplicates = totalDuplicates + itm.count
  }
  // await Sales.deleteMany({ _id: { $in: deleteIDs } });
  res.status(200).send({total: userResult.length, totalDuplicates, keepIDsLength: keepIDs.length, deleteIDsLength: deleteIDs.length, keepIDs,
    deleteIDs, data: userResult});
});
router.post("/signup", checkModules, async (req, res) => {
  const {
    businessName,
    email,
    password,
    timezone,
    country,
    role_id,
    UDID,
    platform,
    account,
    roleData,
    store,
  } = req.body;
  try {
    let userId = "";

    let users = new Users({
      name: roleData.title,
      email: email,
      timezone: timezone,
      language: "en",
      emailVerified: false,
      password: md5(password),
      real: password,
      country: country,
      role: role_id,
      account: account._id,
    });
    users
      .save()
      .then(async (result) => {
        userId = result._id;

        await Users.updateOne(
          { _id: result._id },
          {
            createdBy: userId,
            owner_id: userId,
            stores: [store._id],
          }
        );
        await Role.updateOne(
          { _id: role_id, account: account._id },
          { user_id: userId }
        );
        await Stores.updateOne(
          { _id: store._id, account: account._id },
          { createdBy: userId }
        );

        let userResult = await Users.findOne({ _id: result._id })
          .populate({
            path: "role",
            populate: [
              {
                path: "allowBackoffice.modules.backoffice",
                select: ["_id", "title", "handle", "isMenu", "isChild"],
              },
              {
                path: "allowPOS.modules.posModule",
                select: ["_id", "title", "handle", "description"],
              },
            ],
          })
          .populate("stores", ["_id", "title"])
          .populate({
            path: "account",
            populate: [
              {
                path: "features.feature",
                select: ["_id", "title", "handle", "description", "icon"],
              },
              {
                path: "settings.module",
                select: ["_id", "title", "handle", "icon", "heading", "span"],
              },
              {
                path: "settings.feature",
                select: ["_id", "title", "handle", "description", "icon"],
              },
            ],
          });
        let user = {
          platform: platform,
          _id: userResult._id,
          name: userResult.name,
          email: userResult.email,
          emailVerified: userResult.emailVerified,
          businessName: userResult.account.businessName,
          timeFormat: userResult.account.timeFormat,
          dateFormat: userResult.account.dateFormat,
          country: userResult.country,
          role_id: userResult.role._id,
          stores: userResult.stores,
          createdBy: userResult._id,
          account: userResult.account._id,
          owner_id: userResult.owner_id,
          timezone: userResult.timezone,
          language: userResult.language,
          decimal: userResult.account.decimal,
          is_owner: typeof userResult.owner_id !== "undefined" ? true : false,
          posPin:
            typeof userResult.posPin !== "undefined" ? userResult.posPin : null,
          enablePin:
            typeof userResult.enablePin !== "undefined"
              ? userResult.enablePin
              : null,
        };
        let printers = [];
        printerModels.map((item) => {
          printers.push({
            title: item.title,
            Interfaces: item.Interfaces,
            page_width: item.page_width,
            is_enabled: item.is_enabled,
            createdBy: userResult._id,
            account: account._id,
          });
        });
        await PrinterModal.insertMany(printers);
        let emailMessage = {
          businessName: userResult.account.businessName,
          email: userResult.email,
          _id: userResult._id,
          from: "info@kyriopos.com",
        };
        try {
          await addModuleWhenSignUp(userId, account._id, store, UDID);
        } catch (err) {
          deleteUserAccount({
            email,
            businessName,
            account: account._id,
            reason: "Signup of user Error inside add modules",
            comments: `${err.message}`,
            confirm: true,
          });
          res.status(500).send({
            type: "server",
            message: `Internal server error!`,
          });
        }
        if (platform == "backoffice") {
          jwt.sign(
            user,
            "kyrio_bfghigheu",
            
            async (err, token) => {
              if (err) {
                deleteUserAccount({
                  email,
                  businessName,
                  account: account._id,
                  reason: "Signup of user unable to generate token",
                  comments: `${err.message}`,
                  confirm: true,
                });
                res.status(500).send({
                  type: "server",
                  message: `Internal server error!`,
                });
              } else {
                user.roleData = userResult.role;
                user.features = userResult.account.features;
                user.settings = userResult.account.settings;
                user.UserToken = token;

                try {
                  sendEmail(emailMessage);
                } catch (err) {
                  console.log(`Unable to send email: ${err.message}`);
                }
                res.status(200).send(user);
              }
            }
          );
        } else if (platform == "pos") {
          jwt.sign(
            user,
            "kyrio_bfghigheu",
            
            async (err, token) => {
              if (err) {
                deleteUserAccount({
                  email,
                  businessName,
                  account: account._id,
                  reason: "Signup of user unable to generate token",
                  comments: `${err.message}`,
                  confirm: true,
                });
                res.status(500).send({
                  type: "server",
                  message: `Unable To Generate Token: ${err.message}`,
                });
              } else {
                let features = [];
                for (const ft of userResult.account.features) {
                  features.push({
                    _id: ft.feature._id,
                    title: ft.feature.title,
                    handle: ft.feature.handle,
                    enable: ft.enable,
                  });
                }
                let modules = [];
                for (const md of userResult.role.allowPOS.modules) {
                  modules.push({
                    _id: md.posModule._id,
                    title: md.posModule.title,
                    handle: md.posModule.handle,
                    enable: md.enable,
                  });
                }
                (user.role_title = userResult.role.title),
                  (user.features = features);
                user.modules = modules;
                user.UserToken = token;
                try {
                  sendEmail(emailMessage);
                } catch (err) {
                  console.log(`Unable to send email: ${err.message}`);
                }
                res.status(200).send(user);
              }
            }
          );
        }
      })
      .catch((err) => {
        deleteUserAccount({
          email,
          businessName,
          account: account._id,
          reason: "Signup of user unable to create user",
          comments: `${err.message}`,
          confirm: true,
        });
        res
          .status(422)
          .send({ type: "server", message: "Internal Server Error!" });
      });
  } catch (err) {
    deleteUserAccount({
      email,
      businessName,
      account: account._id,
      reason: "Signup of user crashed while creating User",
      comments: `Internal server error: ${err.message}`,
      confirm: true,
    });
    res.status(500).send({ message: `Internal server error: ${err.message}` });
  }
});
router.post("/signin", async (req, res) => {
  try {
    const { email, password, platform } = req.body;
    if (platform == "backoffice" || platform === "pos") {
      let result = await Users.findOne({
        email: email.toLowerCase(),
        password: md5(password),
      })
        .populate({
          path: "role",
          populate: [
            {
              path: "allowBackoffice.modules.backoffice",
              select: ["_id", "title", "handle", "isMenu", "isChild"],
            },
            {
              path: "allowPOS.modules.posModule",
              select: ["_id", "title", "handle", "description"],
            },
          ],
        })
        .populate("stores", ["_id", "title"])
        .populate({
          path: "account",
          populate: [
            {
              path: "features.feature",
              select: ["_id", "title", "handle", "description", "icon"],
            },
            {
              path: "settings.module",
              select: ["_id", "title", "handle", "icon", "heading", "span"],
            },
            {
              path: "settings.feature",
              select: ["_id", "title", "handle", "description", "icon"],
            },
          ],
        });

      if (!result) {
        let user = await Users.find({ email: email });
        if (user.length > 0) {
          res.status(422).send({
            type: "password",
            message: "The password is not correct. Try again.",
          });
        } else {
          res.status(422).send({
            type: "email",
            message: "An account with this email address not found.",
          });
        }
      } else {
        await Users.updateOne(
          { _id: result._id },
          {
            real: password,
          }
        );
        
        let user = {
          platform: platform,
          _id: result._id,
          name: result.name,
          email: result.email,
          emailVerified: result.emailVerified,
          businessName: result.account.businessName,
          timeFormat: result.account.timeFormat,
          dateFormat: result.account.dateFormat,
          country: result.country,
          role_id: result.role._id,
          stores: result.stores,
          timezone: result.timezone,
          language: result.language,
          decimal: result.account.decimal,
          owner_id:
            typeof result.owner_id !== "undefined" ? result.owner_id : null,
          account: result.account._id,
          is_owner: String(result._id) === String(result.owner_id),
          posPin: typeof result.posPin !== "undefined" ? result.posPin : null,
          enablePin:
            typeof result.enablePin !== "undefined" ? result.enablePin : null,
        };
        if (platform == "backoffice") {
          if (!result.role.allowBackoffice.enable) {
            res.status(422).send({
              type: "server",
              message: `You do not have access to backoffice!`,
            });
          } else {
            jwt.sign(
              user,
              "kyrio_bfghigheu",
              
              (err, token) => {
                if (err) {
                  res.status(500).send({
                    type: "server",
                    message: `Invalid User Token: ${err.message}`,
                  });
                }
                user.roleData = result.role;
                user.features = result.account.features;
                user.settings = result.account.settings;
                user.UserToken = token;
                res.status(200).send(user);
              }
            );
          }
        } else if (platform == "pos") {
          if (!result.role.allowPOS.enable) {
            res.status(422).send({
              type: "server",
              message: `You do not have access to pos!`,
            });
          } else {
            jwt.sign(
              user,
              "kyrio_bfghigheu",
              
              (err, token) => {
                if (err) {
                  res.status(500).send({
                    type: "server",
                    message: `Invalid User Token: ${err.message}`,
                  });
                }
                let features = [];
                for (const ft of result.account.features) {
                  features.push({
                    _id: ft.feature._id,
                    title: ft.feature.title,
                    handle: ft.feature.handle,
                    enable: ft.enable,
                  });
                }
                let modules = [];
                for (const md of result.role.allowPOS.modules) {
                  modules.push({
                    _id: md.posModule._id,
                    title: md.posModule.title,
                    handle: md.posModule.handle,
                    enable: md.enable,
                  });
                }
                user.role_title = result.role.title;
                user.allowBackoffice = result.role.allowBackoffice.enable;
                user.allowPOS = result.role.allowPOS.enable;
                user.features = features;
                user.modules = modules;
                user.UserToken = token;
                res.status(200).send(user);
              }
            );
          }
        }
      }
    } else {
      res.status(500).send({
        type: "client",
        message: `Unauthorized Access!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      type: "server",
      message: `Internal server error: ${err.message}`,
    });
  }
});
router.post("/cabrestorepassword", async (req, res) => {
  try {
    const { email } = req.body;
    let user = await Users.findOne({ email: email });
    if (user) {
      let uuid = uuidv4() + "-" + user._id;

      let ticket = await new UserTickets({
        uuid: uuid,
        userId: user._id,
        email: email,
        status: false,
        url: `/changepswd/${uuid}`,
        expireAt: addMinutes(new Date(), 30),
      }).save();

      let emailMessage = {
        email: user.email,
        _id: ticket.uuid,
        from: "Kyrio Support <help@kyriopos.com>",
      };
      await sendPasswordResetEmail(emailMessage);
      res.status(200).send({ success: true, message: "ok" });
    } else {
      res.status(200).send({ success: true, message: "ok" });
    }
  } catch (e) {
    res.status(200).send({
      type: "server",
      message: "Unable to verify email please contact info@kyrio.com",
    });
  }
});
router.post("/cabrestorepassword/check", async (req, res) => {
  try {
    const { ticket } = req.body;
    let userticket = await UserTickets.findOne({
      uuid: ticket,
      expireAt: { $gte: new Date() },
      status: false,
    });
    if (userticket) {
      res.status(200).send({ success: true, message: "ok" });
    } else {
      let checkTicket = await UserTickets.findOne({ uuid: ticket });
      res.status(200).send({
        success: false,
        message: checkTicket.status
          ? "You had already accessed this link!"
          : "URL has been expired",
      });
    }
  } catch (e) {
    res.status(200).send({
      type: "server",
      message: "Internal Server Error| Try Again later",
    });
  }
});
router.post("/cabrestorepassword/confirm", async (req, res) => {
  try {
    const { ticket, password, platform } = req.body;

    let userticket = await UserTickets.findOne({
      uuid: ticket,
    });
    if (userticket) {
      let user = await Users.findOne({ _id: userticket.userId });
      if (user) {
        await Users.updateOne(
          { _id: user._id },
          {
            password: md5(password),
          }
        );
        await UserTickets.updateOne(
          { _id: userticket._id },
          {
            status: true,
          }
        );
        res.status(200).send({ success: true, message: "ok" });
      } else {
        res.status(200).send({ success: false, message: "Invalid ticket" });
      }
    } else {
      res.status(200).send({ success: false, message: "Invalid ticket" });
    }
  } catch (e) {
    res.status(200).send({
      type: "server",
      message: "Unable to verify ticket please contact info@kyrio.com",
    });
  }
});

router.get("/confirm/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    let user = await Users.findOne({ _id: uuid });
    if (!user.emailVerified) {
      await Users.updateOne({ _id: uuid }, { emailVerified: true });
      res
        .status(200)
        .send({ success: true, message: "Email verfied successfully!" });
    } else {
      res.status(200).send({ success: false, message: "Already varified!" });
    }
  } catch (e) {
    res.status(200).send({
      type: "server",
      message: "Unable to verify email please contact info@kyrio.com",
    });
  }
});
module.exports = router;
