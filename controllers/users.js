import Users from "../modals/users";
import Role from "../modals/role";
import Stores from "../modals/Store";
import POS_Device from "../modals/POS_Device";
import diningOption from "../modals/settings/diningOption";
import taxesOption from "../modals/settings/taxes/taxesOption";
import taxesType from "../modals/settings/taxes/taxesType";
import paymentTypes from "../modals/settings/paymentTypes/paymentTypes";
import paymentsType from "../modals/settings/paymentTypes/paymentsType";
import { checkModules } from "../libs/middlewares";
import md5 from "md5";
import express from "express";
import jwt from "jsonwebtoken";
import sendEmail from "../libs/sendEmail";

var router = express.Router();

router.post("/signup", checkModules, (req, res) => {
  try {
    const { email, password, businessName, country, role_id } = req.body;

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
        await Users.updateOne(
          { _id: result._id },
          { created_by: result._id, owner_id: result._id }
        );
        let roleData = await Role.findOne({ _id: role_id });
        let paymentTypeStoreId = "";
        let user = {
          _id: result._id,
          email: result.email,
          emailVerified: result.emailVerified,
          businessName: result.businessName,
          country: result.country,
          role_id: result.role_id,
          created_by: result._id,
          owner_id: result._id,
        };
        let store = new Stores({
          title: businessName,
          createdBy: result._id,
        });
        store
          .save()
          .then(async (response) => {
            console.log(response);
            paymentTypeStoreId: response._id;
            const newPOSDevice = new POS_Device({
              title: "POS Device",
              store: { storeId: response._id, storeName: response.title },
              createdBy: result._id,
            });
            await newPOSDevice
              .save()
              .then((resu) => {
                console.log("POS DEVICE", resu);
              })
              .catch((e) => console.log(e.message));
            const user = await Users.find({});

            await diningOption
              .create(
                [
                  {
                    title: "Dine in",
                    stores: [
                      { storeId: response._id, storeName: response.title },
                    ],
                    createdBy: result._id,
                  },
                  {
                    title: "Delivery",
                    stores: [
                      { storeId: response._id, storeName: response.title },
                    ],
                    createdBy: result._id,
                  },
                  {
                    title: "Takeout",
                    stores: [
                      { storeId: response._id, storeName: response.title },
                    ],
                    createdBy: result._id,
                  },
                ],
                { oneOperation: true }
              )
              .then((response) => {
                console.log("Default Dining Insert");
              })
              .catch((err) => {
                console.log("Default Dining Insert Error", err.message);
              });
          })
          .catch((e) => console.log(e.message));
        const taxesTypeCheck = await taxesType.find({});
        if (taxesTypeCheck.length === 0) {
          await taxesType
            .create([
              {
                title: "Included in the price",
                createdBy: result._id,
              },
              {
                title: "Added to the price",
                createdBy: result._id,
              },
            ])
            .then((response) => {
              console.log("Default Tax Type Create");
            })
            .catch((err) => {
              console.log("Default Tax Type Insert Error", err.message);
            });
        }
        const taxesOptionCheck = await taxesOption.find({});

        if (taxesOptionCheck.length === 0) {
          await taxesOption
            .create([
              {
                title: "Apply the tax to the new items",
                createdBy: result._id,
              },
              {
                title: "Apply the tax to existing items",
                createdBy: result._id,
              },
              {
                title: "Apply the tax to all new and existing items",
                createdBy: result._id,
              },
            ])
            .then((response) => {
              console.log("Default Tax Option Create");
            })
            .catch((err) => {
              console.log("Default Tax Option Insert Error", err.message);
            });
        }
        const paymentTypesCheck = await paymentTypes.find({});
        if (paymentTypesCheck.length === 0) {
          await paymentTypes
            .create([
              {
                title: "Card",
                createdBy: result._id,
              },
              {
                title: "Check",
                createdBy: result._id,
              },
              {
                title: "Other",
                createdBy: result._id,
              },
              {
                title: "Cash",
                createdBy: result._id,
              },
            ])
            .then((response) => {
              const cash = response.filter(
                (item) => item.title.toUpperCase() === "Cash".toUpperCase()
              )[0];
              const card = response.filter(
                (item) => item.title.toUpperCase() === "Card".toUpperCase()
              )[0];
              paymentsType
                .create([
                  {
                    name: "Cash",
                    paymentType: {
                      paymentTypeId: cash._id,
                      paymentTypeName: cash.title,
                    },
                    storeId: paymentTypeStoreId,
                    createdBy: result._id,
                  },
                  {
                    name: "Card",
                    paymentType: {
                      paymentTypeId: card._id,
                      paymentTypeName: card.title,
                    },
                    storeId: paymentTypeStoreId,
                    createdBy: result._id,
                  },
                ])
                .then((response) => {
                  console.log("Default Payment Types Create");
                })
                .catch((err) => {
                  console.log(
                    "Default Payment Types Insert Error",
                    err.message
                  );
                });
              console.log("Default Payment Type Create", response);
            })
            .catch((err) => {
              console.log("Default Payment Type Insert Error", err.message);
            });
        }

        // let emailMessage = {
        //   businessName: result.businessName,
        //   email: result.email,
        //   _id: result._id,
        //   from: "info@kyrio.com",
        // };
        // sendEmail(emailMessage);
        jwt.sign(user, "kyrio_bfghigheu", (err, token) => {
          if (err) {
            res.status(500).send({
              type: "server",
              message: `Unable To Generate Token: ${err.message}`,
            });
          } else {
            let storesArray = [];
            storesArray.push(store);
            user.UserToken = token;
            user.roleData = roleData;
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
          let user = {
            _id: result._id,
            email: result.email,
            emailVerified: result.emailVerified,
            businessName: result.businessName,
            country: result.country,
            role_id: result.role_id,
            created_by: result._id,
            owner_id: result._id,
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
