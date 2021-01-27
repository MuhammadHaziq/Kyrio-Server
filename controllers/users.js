import Users from "../modals/users";
import Role from "../modals/role";
import Stores from "../modals/Store";
import Accounts from "../modals/accounts";
import Modules from "../modals/modules";
import { checkModules, addModuleWhenSignUp } from "../libs/middlewares";
import md5 from "md5";
import express from "express";
import jwt from "jsonwebtoken";
import sendEmail from "../libs/sendEmail";

var router = express.Router();

router.post("/signup", checkModules, (req, res) => {
  try {
    const { email, password, businessName, country, role_id, UDID } = req.body;
    let userId = "";
    let storeObject = "";
    let users = new Users({
      email: email,
      emailVerified: false,
      password: md5(password),
      businessName: businessName,
      country: country,
      role_id: role_id,
    });
    users
      .save()
      .then(async (result) => {
        userId = result._id;
        let account = {};
        await Modules.findOne()
        .then(async (result) => {
          account = await new Accounts({
            businessName: businessName,
            email: email,
            password: password,
            timezone: null,
            language: "English",
            features: result.features.map((itm) => {
                            return {
                              featureId: itm._id,
                              featureName: itm.featureName,
                              description: itm.description,
                              icon: itm.icon,
                              enable: true,
                            };
                          }),
            settings: {
              settingModules: result.settings.map(
                (itm) => {
                  return {
                    moduleId: itm._id,
                    moduleName: itm.moduleName,
                    icon: itm.icon ? itm.icon : "",
                    heading: itm.heading ? itm.heading : "",
                    span: itm.span ? itm.span : "",
                    enable: true,
                    featureId:
                      result.features.filter(
                        (item) =>
                          item.featureName.toUpperCase() ===
                          itm.moduleName.toUpperCase()
                      ).length > 0
                        ? result.features
                            .filter(
                              (item) =>
                                item.featureName.toUpperCase() ===
                                itm.moduleName.toUpperCase()
                            )
                            .map((item) => {
                              return item._id;
                            })[0]
                        : "",
                  };
                }
              ),
            },
            createdBy: userId,
          }).save();
        })
        await Users.updateOne(
          { _id: result._id },
          { created_by: result._id, owner_id: result._id, accountId: account._id }
        );
        await Role.updateOne(
          { _id: role_id },
          { user_id: result._id, accountId: account._id }
        );
        let roleData = await Role.findOne({ _id: role_id });
        let user = {
          _id: result._id,
          email: result.email,
          emailVerified: result.emailVerified,
          businessName: result.businessName,
          country: result.country,
          role_id: result.role_id,
          created_by: result._id,
          accountId: account._id,
          owner_id: result._id,
        };
        let store = new Stores({
          title: businessName,
          createdBy: result._id,
          accountId: account._id
        });
        await store
          .save()
          .then((response) => {
            storeObject = response;
          })
          .catch((e) => console.log(e.message));

        // let emailMessage = {
        //   businessName: result.businessName,
        //   email: result.email,
        //   _id: result._id,
        //   from: "info@kyrio.com",
        // };
        // sendEmail(emailMessage);
        jwt.sign(user, "kyrio_bfghigheu", async (err, token) => {
          if (err) {
            res.status(500).send({
              type: "server",
              message: `Unable To Generate Token: ${err.message}`,
            });
          } else {
            await addModuleWhenSignUp(userId, account._id, storeObject, UDID);
            let storesArray = [];
            storesArray.push(store);
            user.UserToken = token;
            user.roleData = roleData;
            user.features = account.features;
            user.settings = account.settings;
            user.stores = storesArray;
            res.status(200).send(user);
          }
        });
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
    const { email, password } = req.body;
  
    Users.findOne({ email: email, password: md5(password) })
      .then(async (result) => {
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
          let roleData = await Role.findOne({ _id: result.role_id });
          let stores = await Stores.find({ createdBy: result._id });
          // var paymentTypeStoreId = stores[0]._id;
          let user = {
            _id: result._id,
            email: result.email,
            emailVerified: result.emailVerified,
            businessName: result.businessName,
            country: result.country,
            role_id: result.role_id,
            created_by: result._id,
            owner_id: result._id,
            accountId: result.accountId
          };

          jwt.sign(user, "kyrio_bfghigheu", (err, token) => {
            if (err) {
              res.status(500).send({
                type: "server",
                message: `Invalid User Token: ${err.message}`,
              });
            }
            user.UserToken = token;
            user.roleData = roleData;
            user.stores = stores;
            res.status(200).send(user);
          });
        }
      })
      .catch((err) => {
        res.status(422).send({ message: err.message });
      });
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
    console.log(e.message);
    res.status(200).send({
      type: "server",
      message: "Unable to verify email please contact info@kyrio.com",
    });
  }
});
module.exports = router;
