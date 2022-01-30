import Users from "../modals/users";
import Role from "../modals/role";
import Stores from "../modals/Store";
import Accounts from "../modals/accounts";
import PrinterModal from "../modals/printers/modal";
import { checkModules, addModuleWhenSignUp } from "../libs/middlewares";
import md5 from "md5";
import express from "express";
import jwt from "jsonwebtoken";
import { countryCodes } from "../data/CountryCode";
import { removeSpaces } from "../function/validateFunctions";
import { printerModels } from "../data/Printers";
// import { sendEmail } from "../libs/sendEmail";

var router = express.Router();

router.post("/testapi", async (req, res) => {
  const { param } = req.body;
  //  let accountResult = await Accounts.findOne({ _id: param }).populate('features.feature',["_id","name","description","icon"]).populate('settings.module',["_id","name","icon","heading","span"]).populate('settings.feature',["_id","name","description","icon"])
  //         res.status(200).send(accountResult);
  let userResult = await Users.findOne({ _id: param }).populate({
    path: 'role',
    populate: [{
      path: 'allowBackoffice.modules.backoffice',
      select: ["_id", "title", "handle", "isMenu", "isChild"]
    },
    {
      path: 'allowPOS.modules.posModule',
      select: ["_id", "title", "handle", "description"]
    }]
  })
    .populate('stores', ['_id', 'title'])
    .populate({
      path: 'account',
      populate: [{
        path: 'features.feature',
        select: ["_id", "title", "handle", "description", "icon"]
      },
      {
        path: 'settings.module',
        select: ["_id", "title", "handle", "icon", "heading", "span"]
      },
      {
        path: 'settings.feature',
        select: ["_id", "title", "handle", "description", "icon"]
      }]
    });
  res.status(200).send(userResult);

})
router.post("/signup", checkModules, async (req, res) => {
  try {
    const { email, password, timezone, businessName, country, role_id, UDID, features, settings, platform } = req.body;
    let userId = "";
    let roleData = await Role.findOne({ _id: role_id });
    const countryList = countryCodes.find(item => {
      let listCountry = item.country.split('(').join('')
      listCountry = listCountry.split(')').join('')
      listCountry = removeSpaces(listCountry)
      let searchCountry = country.split('(').join('')
      searchCountry = searchCountry.split(')').join('')
      searchCountry = removeSpaces(searchCountry)
      return listCountry.toLowerCase() === searchCountry.toLowerCase()
    })
    let decimalValue = "";
    if (typeof countryList === "undefined" || typeof countryList.decimalValue === "undefined") {
      decimalValue = 2;
    } else {

      decimalValue = countryList.decimalValue
    }
    let users = new Users({
      name: roleData.title,
      email: email,
      timezone: timezone,
      language: "en",
      emailVerified: false,
      password: md5(password),
      country: country,
      role: role_id
    });
    users
      .save()
      .then(async (result) => {
        userId = result._id;

        let featuresArr = features.map((itm) => {
          return {
            feature: itm._id,
            enable: true,
          };
        })
        let settingsArr = settings.map(
          (itm) => {
            return {
              module: itm._id,
              feature:
                features.filter(
                  (item) =>
                    item.title.toUpperCase() ===
                    itm.title.toUpperCase()
                ).length > 0
                  ? features
                    .filter(
                      (item) =>
                        item.title.toUpperCase() ===
                        itm.title.toUpperCase()
                    )
                    .map((item) => {
                      return item._id;
                    })[0]
                  : null,
              enable: true,
            };
          }
        );
        let account = await new Accounts({
          businessName: businessName,
          decimal: decimalValue || 2,
          timeFormat: "24",
          dateFormat: "",
          features: featuresArr,
          settings: settingsArr,
          createdBy: userId,
        }).save();

        let accountResult = await Accounts.findOne({ _id: account._id }).populate('features.feature', ["_id", "title", "handle", "description", "icon"]).populate('settings.module', ["_id", "title", "handle", "icon", "heading", "span"]).populate('settings.feature', ["_id", "title", "handle", "description", "icon"])

        let store = new Stores({
          title: accountResult.businessName,
          createdBy: result._id,
          account: accountResult._id
        });
        let storeObject = await store.save();

        await Users.updateOne(
          { _id: result._id },
          { createdBy: result._id, owner_id: result._id, account: accountResult._id, stores: [storeObject._id] }
        );
        await Role.updateOne(
          { _id: role_id },
          { user_id: result._id, account: accountResult._id }
        );
        let userResult = await Users.findOne({ _id: result._id }).populate({
          path: 'role',
          populate: [{
            path: 'allowBackoffice.modules.backoffice',
            select: ["_id", "title", "handle", "isMenu", "isChild"]
          },
          {
            path: 'allowPOS.modules.posModule',
            select: ["_id", "title", "handle", "description"]
          }]
        })
          .populate('stores', ['_id', 'title'])
          .populate({
            path: 'account',
            populate: [{
              path: 'features.feature',
              select: ["_id", "title", "handle", "description", "icon"]
            },
            {
              path: 'settings.module',
              select: ["_id", "title", "handle", "icon", "heading", "span"]
            },
            {
              path: 'settings.feature',
              select: ["_id", "title", "handle", "description", "icon"]
            }]
          })
        // let emailMessage = {
        //   businessName: userResult.account.businessName,
        //   email: userResult.email,
        //   _id: userResult._id,
        //   from: "info@kyrio.com",
        // };
        // sendEmail(emailMessage);
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
          posPin: typeof userResult.posPin !== "undefined" ? userResult.posPin : null,
          enablePin: typeof userResult.enablePin !== "undefined" ? userResult.enablePin : null
        };
        let printers = []
        printerModels.map(item => {
          printers.push({
            title: item.title,
            Interfaces: item.Interfaces,
            page_width: item.page_width,
            is_enabled: item.is_enabled,
            createdBy: userResult._id,
            account: accountResult._id,
          });
        })
        await PrinterModal.insertMany(printers)
        if (platform == "backoffice") {

          jwt.sign(user, "kyrio_bfghigheu", async (err, token) => {
            if (err) {
              res.status(500).send({
                type: "server",
                message: `Unable To Generate Token: ${err.message}`,
              });
            } else {
              await addModuleWhenSignUp(userId, accountResult._id, storeObject, UDID);

              user.roleData = userResult.role
              user.features = userResult.account.features
              user.settings = userResult.account.settings
              user.UserToken = token;
              res.status(200).send(user);
            }
          });
        } else if (platform == "pos") {
          jwt.sign(user, "kyrio_bfghigheu", async (err, token) => {
            if (err) {
              res.status(500).send({
                type: "server",
                message: `Unable To Generate Token: ${err.message}`,
              });
            } else {
              await addModuleWhenSignUp(userId, accountResult._id, storeObject, UDID);

              let features = []
              for (const ft of userResult.account.features) {
                features.push({
                  _id: ft.feature._id,
                  title: ft.feature.title,
                  handle: ft.feature.handle,
                  enable: ft.enable
                })
              }
              let modules = []
              for (const md of userResult.role.allowPOS.modules) {
                modules.push({
                  _id: md.posModule._id,
                  title: md.posModule.title,
                  handle: md.posModule.handle,
                  enable: md.enable
                })
              }
              user.role_title = userResult.role.title,
                user.features = features
              user.modules = modules
              user.UserToken = token
              res.status(200).send(user);
            }
          });
        }
      })
      .catch((err) => {
        res.status(422).send({ type: "server", message: err.message });
      });
  } catch (err) {
    res.status(500).send({ message: `Internal server error: ${err.message}` });
  }
});
router.post("/signin", async (req, res) => {
  try {
    const { email, password, platform } = req.body;
    if (platform == "backoffice" || platform === "pos") {

      let result = await Users.findOne({ email: email, password: md5(password) }).populate({
        path: 'role',
        populate: [{
          path: 'allowBackoffice.modules.backoffice',
          select: ["_id", "title", "handle", "isMenu", "isChild"]
        },
        {
          path: 'allowPOS.modules.posModule',
          select: ["_id", "title", "handle", "description"]
        }]
      })
        .populate('stores', ['_id', 'title'])
        .populate({
          path: 'account',
          populate: [{
            path: 'features.feature',
            select: ["_id", "title", "handle", "description", "icon"]
          },
          {
            path: 'settings.module',
            select: ["_id", "title", "handle", "icon", "heading", "span"]
          },
          {
            path: 'settings.feature',
            select: ["_id", "title", "handle", "description", "icon"]
          }]
        })

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
          owner_id: typeof result.owner_id !== "undefined" ? result.owner_id : null,
          account: result.account._id,
          is_owner: String(result._id) === String(result.owner_id),
          posPin: typeof result.posPin !== "undefined" ? result.posPin : null,
          enablePin: typeof result.enablePin !== "undefined" ? result.enablePin : null
        };
        if (platform == "backoffice") {
          if (!result.role.allowBackoffice.enable) {
            res.status(422).send({
              type: "server",
              message: `You do not have access to backoffice!`,
            });
          } else {
            jwt.sign(user, "kyrio_bfghigheu", (err, token) => {
              if (err) {
                res.status(500).send({
                  type: "server",
                  message: `Invalid User Token: ${err.message}`,
                });
              }
              user.roleData = result.role
              user.features = result.account.features
              user.settings = result.account.settings
              user.UserToken = token;
              res.status(200).send(user);
            });
          }
        } else if (platform == "pos") {
          if (!result.role.allowPOS.enable) {
            res.status(422).send({
              type: "server",
              message: `You do not have access to pos!`,
            });
          } else {
            jwt.sign(user, "kyrio_bfghigheu", (err, token) => {
              if (err) {
                res.status(500).send({
                  type: "server",
                  message: `Invalid User Token: ${err.message}`,
                });
              }
              let features = []
              for (const ft of result.account.features) {
                features.push({
                  _id: ft.feature._id,
                  title: ft.feature.title,
                  handle: ft.feature.handle,
                  enable: ft.enable
                })
              }
              let modules = []
              for (const md of result.role.allowPOS.modules) {
                modules.push({
                  _id: md.posModule._id,
                  title: md.posModule.title,
                  handle: md.posModule.handle,
                  enable: md.enable
                })
              }
              user.role_title = result.role.title,
                user.features = features
              user.modules = modules
              user.UserToken = token;
              res.status(200).send(user);
            });
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
router.get("/confirm", async (req, res) => {
  try {
    const { u } = req.query;
    await Users.updateOne({ _id: u }, { emailVerified: true });
    res
      .status(200)
      .send({ type: "email", message: "Email Verfied Successfully!" });
  } catch (e) {
    // console.log(e.message);
    res.status(200).send({
      type: "server",
      message: "Unable to verify email please contact info@kyrio.com",
    });
  }
});
module.exports = router;
