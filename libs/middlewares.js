import Users from "../modals/users";
import Accounts from "../modals/accounts";
import Features from "../modals/modules/features";
import Backoffice from "../modals/modules/backoffice";
import PosModule from "../modals/modules/posModule";
import Settings from "../modals/modules/settings";
import Role from "../modals/role";
import Stores from "../modals/Store";
import POS_Device from "../modals/POS_Device";
import diningOption from "../modals/settings/diningOption";
import taxesOption from "../modals/settings/taxes/taxesOption";
import taxesType from "../modals/settings/taxes/taxesType";
import paymentMethods from "../modals/settings/paymentTypes/paymentMethods";
import paymentsType from "../modals/settings/paymentTypes/paymentsType";
import { modulesData } from "../data/data";
import { countryCodes } from "../data/CountryCode";
import { removeSpaces } from "../function/validateFunctions";
import { deleteUserAccount } from "../function/globals";
import jwt from "jsonwebtoken";
import validator from "email-validator";
import jwt_decode from "jwt-decode";

export const checkModules = (req, res, next) => {
  const { email, platform, businessName, country } = req.body;
  try {
    if (platform == "backoffice" || platform === "pos") {
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
            let features = await Features.find();
            if (features.length <= 0) {
              features = await Features.insertMany(modulesData.features);
            }
            let backoffice = await Backoffice.find();
            if (backoffice.length <= 0) {
              backoffice = await Backoffice.insertMany(
                modulesData.backofficeModules
              );
            }
            let posModule = await PosModule.find();
            if (posModule.length <= 0) {
              posModule = await PosModule.insertMany(modulesData.posModules);
            }
            let settings = await Settings.find();
            if (settings.length <= 0) {
              settings = await Settings.insertMany(modulesData.settings);
            }

            let featuresArr = features.map((itm) => {
              return {
                feature: itm._id,
                enable: true,
              };
            });
            let settingsArr = settings.map((itm) => {
              return {
                module: itm._id,
                feature:
                  features.filter(
                    (item) =>
                      item.title.toUpperCase() === itm.title.toUpperCase()
                  ).length > 0
                    ? features
                        .filter(
                          (item) =>
                            item.title.toUpperCase() === itm.title.toUpperCase()
                        )
                        .map((item) => {
                          return item._id;
                        })[0]
                    : null,
                enable: true,
              };
            });
            const countryList = countryCodes.find((item) => {
              let listCountry = item.country.split("(").join("");
              listCountry = listCountry.split(")").join("");
              listCountry = removeSpaces(listCountry);
              let searchCountry = country.split("(").join("");
              searchCountry = searchCountry.split(")").join("");
              searchCountry = removeSpaces(searchCountry);
              return listCountry.toLowerCase() === searchCountry.toLowerCase();
            });
            let decimalValue = "";
            if (
              typeof countryList === "undefined" ||
              typeof countryList.decimalValue === "undefined"
            ) {
              decimalValue = 2;
            } else {
              decimalValue = countryList.decimalValue;
            }
            let account = await new Accounts({
              businessName: businessName,
              decimal: decimalValue || 2,
              timeFormat: "24",
              dateFormat: "",
              features: featuresArr,
              settings: settingsArr,
            }).save();

            const store = await new Stores({
              title: businessName,
              account: account._id,
            }).save();

            let roleData = {
              title: "Owner",
              account: account._id,
              allowBackoffice: {
                enable: true,
                modules: backoffice.map((itm) => {
                  return {
                    backoffice: itm._id,
                    enable: true,
                  };
                }),
              },
              allowPOS: {
                enable: true,
                modules: posModule.map((itm) => {
                  return {
                    posModule: itm._id,
                    enable: true,
                  };
                }),
              },
            };
            let role = new Role(roleData);
            role
              .save()
              .then((RoleInserted) => {
                req.body.role_id = RoleInserted._id;
                req.body.roleData = RoleInserted;
                req.body.title = RoleInserted.title;
                req.body.account = account;
                req.body.store = store;

                next();
              })
              .catch((err) => {
                deleteUserAccount({
                  email,
                  businessName,
                  account: account._id,
                  reason: "Signup of user crashed while creating Role",
                  comments: `Unable to Save Role ${err.message}`,
                  confirm: true,
                });
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

export const paginate = async (Model, req, filter) => {
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 10);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const result = {};
  // change Model.length to Model.countDocuments() because you are counting directly from mongodb
  if (endIndex < (await Model.countDocuments().exec())) {
    result.next = {
      page: page + 1,
      limit: limit,
    };
  }
  // if (startIndex > 0) {
  result.previous = {
    page: page - 1,
    limit: limit,
  };
  // }
  try {
    //       .limit(limit).skip(startIndex) replaced the slice method because
    //       it is done directly from mongodb and they are one of mongodb methods
    result.results = await Model.find(filter)
      .sort({ _id: "desc" })
      .limit(limit)
      .skip(startIndex);
    return { status: "ok", result };
  } catch (e) {
    return { status: "error", message: e.message };
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
    // jwt.verify(bearerToken, "kyrio_bfghigheu", (err, authData) => {
    //   if (err) {
    //     res.sendStatus(401);
    //   } else {
    var decoded = jwt_decode(bearerToken);
    // console.log(decoded);
    Users.find({ _id: decoded._id }).then((response) => {
      if (response.length > 0) {
        req.authData = decoded;
        next();
      } else {
        res.sendStatus(401);
      }
    });
    // }
    // });
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

  // try {
  let result = await POS_Device.find({ account: account })
    .sort({ deviceNo: -1 })
    .limit(1);
  let deviceNo =
    typeof result[0] !== "undefined" ? parseInt(result[0].deviceNo) + 1 : 1;
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
  // } catch (error) {
  //   console.log("POS Device Catch Error", error.message);
  // }

  // try {
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
  // } catch (error) {
  //   console.log("Default Dining Catch Error", error.message);
  // }
  const taxesTypeCheck = await taxesType.find();
  if (taxesTypeCheck.length === 0) {
    // try {
    await taxesType
      .create([
        {
          title: "Included in the price",
        },
        {
          title: "Added to the price",
        },
      ])
      .then((response) => {
        console.log("Default Tax Type Create");
      })
      .catch((err) => {
        console.log("Default Tax Type Insert Error", err.message);
      });
    // } catch (error) {
    //   console.log("Default Tax Type Catch Error", error.message);
    // }
  }
  const taxesOptionCheck = await taxesOption.find();

  if (taxesOptionCheck.length === 0) {
    // try {
    await taxesOption
      .create([
        {
          title: "Apply the tax to the new items",
        },
        {
          title: "Apply the tax to existing items",
        },
        {
          title: "Apply the tax to all new and existing items",
        },
      ])
      .then((response) => {
        console.log("Default Tax Option Create");
      })
      .catch((err) => {
        console.log("Default Tax Option Insert Error", err.message);
      });
    // } catch (error) {
    //   console.log("Default Tax Option Catch Error", error.message);
    // }
  }
  const paymentTypesCheck = await paymentMethods.find({ account: account });
  if (paymentTypesCheck.length === 0) {
    // try {
    await paymentMethods
      .create([
        {
          title: process.env.DEFAULT_PAYMENT_TYPES_1,
          createdBy: userId,
          account: account,
        },
        {
          title: process.env.DEFAULT_PAYMENT_TYPES_2,
          createdBy: userId,
          account: account,
        },
        {
          title: process.env.DEFAULT_PAYMENT_TYPES_3,
          createdBy: userId,
          account: account,
        },
        {
          title: process.env.DEFAULT_PAYMENT_TYPES_4,
          createdBy: userId,
          account: account,
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
    // } catch (error) {
    //   console.log("Default Payment Method Catch Error", error.message);
    // }
  }

  // try {
  await paymentsType
    .create([
      {
        title: process.env.DEFAULT_PAYMENT_TYPE_1,
        paymentMethod: cash._id,
        store: paymentTypeStoreId,
        createdBy: userId,
        account: account,
        cashPaymentRound: 0.0,
      },
      {
        title: process.env.DEFAULT_PAYMENT_TYPE_2,
        paymentMethod: cash._id,
        store: paymentTypeStoreId,
        createdBy: userId,
        account: account,
        cashPaymentRound: 0.0,
      },
    ])
    .then((response) => {
      console.log("Default Payment Types Create");
    })
    .catch((err) => {
      console.log("Default Payment Types Insert Error", err.message);
    });
  // } catch (error) {
  //   console.log("Default Payment Types Catch Error", error.message);
  // }
};
