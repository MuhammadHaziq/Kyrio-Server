import Users from "../modals/users";
import Role from "../modals/role";
import Stores from "../modals/Store";
// import POS_Device from "../modals/POS_Device";
// import diningOption from "../modals/settings/diningOption";
// import taxesOption from "../modals/settings/taxes/taxesOption";
// import taxesType from "../modals/settings/taxes/taxesType";
// import paymentTypes from "../modals/settings/paymentTypes/paymentTypes";
// import paymentsType from "../modals/settings/paymentTypes/paymentsType";
import { checkModules, addModuleWhenSignUp } from "../libs/middlewares";
import md5 from "md5";
import express from "express";
import jwt from "jsonwebtoken";
import sendEmail from "../libs/sendEmail";

var router = express.Router();

router.post("/signup", checkModules, (req, res) => {
  try {
    const { email, password, businessName, country, role_id } = req.body;
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
        await Users.updateOne(
          { _id: result._id },
          { created_by: result._id, owner_id: result._id }
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
          owner_id: result._id,
        };
        let store = new Stores({
          title: businessName,
          createdBy: result._id,
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
            await addModuleWhenSignUp(userId, storeObject);
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
          // var paymentTypeStoreId = stores[0]._id;
          // let user = {
          //   _id: result._id,
          //   email: result.email,
          //   emailVerified: result.emailVerified,
          //   businessName: result.businessName,
          //   country: result.country,
          //   role_id: result.role_id,
          //   created_by: result._id,
          //   owner_id: result._id,
          // };
          // const store = await Stores.find({ createdBy: result._id })
          //   .select(["title"])
          //   .sort({ _id: "desc" });
          // let storeDataDining1 = [];
          // store.map((item, index) => {
          //   return storeDataDining1.push({
          //     storeId: item._id,
          //     storeName: item.title,
          //     position: 0,
          //   });
          // });
          // let storeDataDining2 = [];
          // store.map((item, index) => {
          //   return storeDataDining2.push({
          //     storeId: item._id,
          //     storeName: item.title,
          //     position: 1,
          //   });
          // });
          // let storeDataDining3 = [];
          // store.map((item, index) => {
          //   return storeDataDining3.push({
          //     storeId: item._id,
          //     storeName: item.title,
          //     position: 2,
          //   });
          // });
          // await diningOption
          //   .create(
          //     [
          //       {
          //         title: process.env.DEFAULT_DINING_TITLE_1,
          //         stores: storeDataDining1,
          //         createdBy: result._id,
          //       },
          //       {
          //         title: process.env.DEFAULT_DINING_TITLE_2,
          //         stores: storeDataDining2,
          //         createdBy: result._id,
          //       },
          //       {
          //         title: process.env.DEFAULT_DINING_TITLE_3,
          //         stores: storeDataDining3,
          //         createdBy: result._id,
          //       },
          //     ],
          //     { oneOperation: true }
          //   )
          //   .then((response) => {
          //     console.log("Default Dining Insert");
          //   })
          //   .catch((err) => {
          //     console.log("Default Dining Insert Error", err.message);
          //   });
          // const paymentTypesCheck = await paymentTypes.find({});
          // const cash = paymentTypesCheck.filter(
          //   (item) => item.title.toUpperCase() === "Cash".toUpperCase()
          // )[0];
          // const card = paymentTypesCheck.filter(
          //   (item) => item.title.toUpperCase() === "Card".toUpperCase()
          // )[0];
          // paymentsType
          //   .create([
          //     {
          //       name: process.env.DEFAULT_PAYMENT_TYPE_1,
          //       paymentType: {
          //         paymentTypeId: cash._id,
          //         paymentTypeName: cash.title,
          //       },
          //       storeId: paymentTypeStoreId,
          //       createdBy: result._id,
          //     },
          //     {
          //       name: process.env.DEFAULT_PAYMENT_TYPE_2,
          //       paymentType: {
          //         paymentTypeId: card._id,
          //         paymentTypeName: card.title,
          //       },
          //       storeId: paymentTypeStoreId,
          //       createdBy: result._id,
          //     },
          //   ])
          //   .then((response) => {
          //     console.log("Default Payment Types Create");
          //   })
          //   .catch((err) => {
          //     console.log("Default Payment Types Insert Error", err.message);
          //   });

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
