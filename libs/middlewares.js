import Users from "../modals/users";
import Features from "../modals/modules/features";
import Backoffice from "../modals/modules/backoffice";
import PosModule from "../modals/modules/posModule";
import Settings from "../modals/modules/settings";
import Role from "../modals/role";
import POS_Device from "../modals/POS_Device";
import diningOption from "../modals/settings/diningOption";
import taxesOption from "../modals/settings/taxes/taxesOption";
import taxesType from "../modals/settings/taxes/taxesType";
import paymentMethods from "../modals/settings/paymentTypes/paymentMethods";
import paymentsType from "../modals/settings/paymentTypes/paymentsType";
import { modulesData } from "../data/data";
import jwt from "jsonwebtoken";
import validator from "email-validator";

export const checkModules = (req, res, next) => {
  const { email, platform } = req.body;
  try{
  if(platform == "backoffice" || platform === "pos"){
    Users.find({
      email: email,
    }).then(async (result) => {
      if (result.length > 0) {
        res.status(422).send({
          type: "email",
          message: "An account with this email address already exists",
        });
      } else {
        if (validator.validate(email)) {

          let features = await Features.find()
          if(features.length <= 0){
            features = await Features.insertMany(modulesData.features);
          }
          let backoffice = await Backoffice.find()
          if(backoffice.length <= 0){
            backoffice = await Backoffice.insertMany(modulesData.backofficeModules);
          }
          let posModule = await PosModule.find()
          if(posModule.length <= 0){
            posModule = await PosModule.insertMany(modulesData.posModules);
          }
          let settings = await Settings.find()
          if(settings.length <= 0){
            settings = await Settings.insertMany(modulesData.settings);
          }

          let roleData = {
            title: "Owner",
            allowBackoffice: {
              enable: true,
              modules: backoffice.map((itm) => {
                return {
                  backoffice: itm._id,
                  enable: true
                };
              }),
            },
            allowPOS: {
              enable: true,
              modules: posModule.map((itm) => {
                return {
                  posModule: itm._id,
                  enable: true
                };
              }),
            },
          };
          let role = new Role(roleData);
          role
            .save()
            .then((RoleInserted) => {
              req.body.role_id = RoleInserted._id;
              req.body.title = RoleInserted.title;
              req.body.features = features;
              req.body.settings = settings;

              next();
            })
            .catch((err) => {
              res.status(403).send({
                type: "server",
                message: `Unable to Save Role ${err.message}`,
              });
            });
        } else {
          res.status(422).send({
            type: "email",
            message: "Invalid Email Address",
          });
        }
      }
    });
  } else {
    res.status(500).send({
      type: "client",
      message: `Unauthorized Access!`,
    });        
  }
  } catch (e) {
    res.status(422).send({
        type: "server",
        message: e.message,
      });
  }
};

export const verifyToken = (req, res, next) => {
  // Get auth header value
  // console.log(req.headers);
  const bearerToken = req.headers["kyriotoken"];
  // Check if bearer is undefined
  if (typeof bearerToken !== "undefined") {
    // Set the token
    req.token = bearerToken;
    jwt.verify(bearerToken, "kyrio_bfghigheu", (err, authData) => {
      if (err) {
        res.sendStatus(401);
      } else {
        Users.find({ _id: authData._id }).then(response => {
          if (response.length > 0) {
            req.authData = authData;
            next();
          } else {
            res.sendStatus(401);
          }

        })

      }
    });
    // Next middleware
  } else {
    res.sendStatus(401);
  }
};

/**

  Haziq

***/

export const addModuleWhenSignUp = async (userId, account, store, UDID) => {

  let paymentTypeStoreId = "";
  let cash = "";
  let card = "";
  paymentTypeStoreId = store._id;

  try {
    let result = await POS_Device.find({ account: account }).sort({ deviceNo: -1 }).limit(1);
    let deviceNo = typeof result[0] !== "undefined" ? parseInt(result[0].deviceNo) + 1 : 1;
    const newPOSDevice = new POS_Device({
      title: "POS Device",
      deviceNo: deviceNo,
      account: account,
      store: store._id,
      createdBy: userId,
      isActive: typeof UDID !== "undefined" ? true : false,
      udid: typeof UDID !== "undefined" ? UDID : null,
    });
    await newPOSDevice
      .save()
      .then(() => {
        // console.log("POS DEVICE", resu);
      })
      .catch((e) => console.log("POS Device Response Catch Error", e.message));
  } catch (error) {
    console.log("POS Device Catch Error", error.message);
  }

  try {
    await diningOption
      .create(
        [
          {
            title: process.env.DEFAULT_DINING_TITLE_1,
            account: account,
            stores: [
              {
                store: store._id,
                isActive: true,
                position: 0,
              },
            ],
            createdBy: userId,
          },
          {
            title: process.env.DEFAULT_DINING_TITLE_2,
            account: account,
            stores: [
              {
                store: store._id,
                isActive: true,
                position: 1,
              },
            ],
            createdBy: userId,
          },
          {
            title: process.env.DEFAULT_DINING_TITLE_3,
            account: account,
            stores: [
              {
                store: store._id,
                isActive: true,
                position: 2,
              },
            ],
            createdBy: userId,
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
  } catch (error) {
    console.log("Default Dining Catch Error", error.message);
  }
  const taxesTypeCheck = await taxesType.find();
  if (taxesTypeCheck.length === 0) {
    try {
      await taxesType
        .create([
          {
            title: "Included in the price"
          },
          {
            title: "Added to the price"
          },
        ])
        .then((response) => {
          console.log("Default Tax Type Create");
        })
        .catch((err) => {
          console.log("Default Tax Type Insert Error", err.message);
        });
    } catch (error) {
      console.log("Default Tax Type Catch Error", error.message);
    }
  }
  const taxesOptionCheck = await taxesOption.find();

  if (taxesOptionCheck.length === 0) {
    try {
      await taxesOption
        .create([
          {
            title: "Apply the tax to the new items"
          },
          {
            title: "Apply the tax to existing items"
          },
          {
            title: "Apply the tax to all new and existing items"
          }
        ])
        .then((response) => {
          console.log("Default Tax Option Create");
        })
        .catch((err) => {
          console.log("Default Tax Option Insert Error", err.message);
        });
    } catch (error) {
      console.log("Default Tax Option Catch Error", error.message);
    }
  }
  const paymentTypesCheck = await paymentMethods.find();
  if (paymentTypesCheck.length === 0) {
    try {
      await paymentMethods
        .create([
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_1,
            createdBy: userId,
            account: account
          },
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_2,
            createdBy: userId,
            account: account
          },
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_3,
            createdBy: userId,
            account: account
          },
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_4,
            createdBy: userId,
            account: account
          },
        ])
        .then((response) => {
          cash = response.filter(
            (item) => item.title.toUpperCase() === "Cash".toUpperCase()
          )[0];
          card = response.filter(
            (item) => item.title.toUpperCase() === "Card".toUpperCase()
          )[0];
          // console.log("Default Payment Type Create", response);
          console.log("Default Payment Method Create");
        })
        .catch((err) => {
          console.log("Default Payment Method Insert Error", err.message);
        });
    } catch (error) {
      console.log("Default Payment Method Catch Error", error.message);
    }
  }

  try {
    await paymentsType
      .create([
        {
          title: process.env.DEFAULT_PAYMENT_TYPE_1,
          paymentMethod: cash._id,
          store: paymentTypeStoreId,
          createdBy: userId,
          account: account,
          cashPaymentRound: 0.00
        },
        {
          title: process.env.DEFAULT_PAYMENT_TYPE_2,
          paymentMethod: cash._id,
          store: paymentTypeStoreId,
          createdBy: userId,
          account: account,
          cashPaymentRound: 0.00
        },
      ])
      .then((response) => {
        console.log("Default Payment Types Create");
      })
      .catch((err) => {
        console.log("Default Payment Types Insert Error", err.message);
      });
  } catch (error) {
    console.log("Default Payment Types Catch Error", error.message);
  }
};
