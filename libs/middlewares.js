import Users from "../modals/users";
import Modules from "../modals/modules";
import Role from "../modals/role";
import POS_Device from "../modals/POS_Device";
import diningOption from "../modals/settings/diningOption";
import taxesOption from "../modals/settings/taxes/taxesOption";
import taxesType from "../modals/settings/taxes/taxesType";
import paymentTypes from "../modals/settings/paymentTypes/paymentTypes";
import paymentsType from "../modals/settings/paymentTypes/paymentsType";
import { modulesData } from "../data/data";
import jwt from "jsonwebtoken";
import validator from "email-validator";

export const checkModules = (req, res, next) => {
  const { email, businessName } = req.body;
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

        Modules.findOne()
          .then((result) => {
            if (result != null) {
              //****************Commented because when this API will trigger only a new role with Owner status will be created
              // Role.findOne({
              //   roleName: "Owner",
              // })
              //   .then((roleData) => {

                  // if (roleData != null) {
                  //   req.body.role_id = roleData._id;
                  //   req.body.roleName = "Owner";
                  //   next();
                  // } else {

                    let roleData = {
                      roleName: "Owner",
                      features: result.features.map((itm) => {
                        return {
                          featureId: itm._id,
                          featureName: itm.featureName,
                          description: itm.description,
                          icon: itm.icon,
                          enable: true,
                        };
                      }),
                      allowBackoffice: {
                        enable: true,
                        modules: result.backofficeModules.map((itm) => {
                          return {
                            moduleId: itm._id,
                            moduleName: itm.moduleName,
                            isMenu: itm.isMenu,
                            isChild: itm.isChild,
                            enable: true,
                          };
                        }),
                      },
                      allowPOS: {
                        enable: true,
                        modules: result.posModules.map((itm) => {
                          return {
                            moduleId: itm._id,
                            moduleName: itm.moduleName,
                            enable: true,
                          };
                        }),
                      },
                      settings: {
                        settingModules: result.settings.map((itm) => {
                          return {
                            moduleId: itm._id,
                            moduleName: itm.moduleName,
                            icon: itm.icon,
                            heading: itm.heading,
                            span: itm.span,
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
                        }),
                      },
                    };
                    let role = new Role(roleData);
                    role
                      .save()
                      .then((RoleInserted) => {
                        req.body.role_id = RoleInserted._id;
                        req.body.roleName = "Owner";
                        next();
                      })
                      .catch((err) => {
                        res.status(403).send({
                          type: "server",
                          message: `Unable to Save Role ${err.message}`,
                        });
                      });
                  // }
                // })
                // .catch((err) => {
                //   res.status(403).send({
                //     type: "server",
                //     message: `Unable to find Role ${err.message}`,
                //   });
                // });
            } else {
              let modules = new Modules(modulesData);
              modules
                .save()
                .then((insertedRecord) => {
                  //****************Commented because when this API will trigger only a new role with Owner status will be created
                  // Role.findOne({
                  //   roleName: "Owner",
                  // })
                  //   .then((roleData) => {
                  //     if (roleData != null) {
                  //       req.body.role_id = roleData._id;
                  //       req.body.roleName = "Owner";
                  //       next();
                  //     } else {
                        let roleData = {
                          roleName: "Owner",
                          features: insertedRecord.features.map((itm) => {
                            return {
                              featureId: itm._id,
                              featureName: itm.featureName,
                              description: itm.description,
                              icon: itm.icon,
                              enable: true,
                            };
                          }),
                          allowBackoffice: {
                            enable: true,
                            modules: insertedRecord.backofficeModules.map(
                              (itm) => {
                                return {
                                  moduleId: itm._id,
                                  moduleName: itm.moduleName,
                                  features: itm.features,
                                  isMenu: itm.isMenu,
                                  isChild: itm.isChild,
                                  enable: true,
                                };
                              }
                            ),
                          },
                          allowPOS: {
                            enable: true,
                            modules: insertedRecord.posModules.map((itm) => {
                              return {
                                moduleId: itm._id,
                                moduleName: itm.moduleName,
                                enable: true,
                              };
                            }),
                          },
                          settings: {
                            settingModules: insertedRecord.settings.map(
                              (itm) => {
                                return {
                                  moduleId: itm._id,
                                  moduleName: itm.moduleName,
                                  icon: itm.icon ? itm.icon : "",
                                  heading: itm.heading ? itm.heading : "",
                                  span: itm.span ? itm.span : "",
                                  enable: true,
                                  featureId:
                                    insertedRecord.features.filter(
                                      (item) =>
                                        item.featureName.toUpperCase() ===
                                        itm.moduleName.toUpperCase()
                                    ).length > 0
                                      ? insertedRecord.features
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
                        };
                        let role = new Role(roleData);
                        role
                          .save()
                          .then((RoleInserted) => {
                            req.body.role_id = RoleInserted._id;
                            req.body.roleName = "Owner";
                            next();
                          })
                          .catch((err) => {
                            res.status(403).send({
                              message: `Unable to Save Role ${err.message}`,
                            });
                          });
                      // }
                    // })
                    // .catch((err) => {
                    //   res.status(403).send({
                    //     message: `Unable to find Role ${err.message}`,
                    //   });
                    // });
                })
                .catch((err) => {
                  res.status(403).send({
                    message: `Unable to Save Module ${err.message}`,
                  });
                });
            }
          })
          .catch((err) => {
            res.status(403).send({
              message: `Unable to Find Module ${err.message}`,
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
        res.sendStatus(403);
      } else {
        req.authData = authData;
        next();
      }
    });
    // Next middleware
  } else {
    res.sendStatus(403);
  }
};

/**

  Haziq

***/

export const addModuleWhenSignUp = async (userId, store) => {
  let paymentTypeStoreId = "";
  let cash = "";
  let card = "";
  paymentTypeStoreId = store._id;
  const posDeviceData = {
    storeId: store._id,
    storeName: store.title,
  };
  try {
    const newPOSDevice = new POS_Device({
      title: "POS Device",
      store: posDeviceData,
      createdBy: userId,
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
  const user = await Users.find({});
  try {
    await diningOption
      .create(
        [
          {
            title: process.env.DEFAULT_DINING_TITLE_1,
            stores: [
              {
                storeId: store._id,
                storeName: store.title,
                isActive: true,
                position: 0,
              },
            ],
            createdBy: userId,
          },
          {
            title: process.env.DEFAULT_DINING_TITLE_2,
            stores: [
              {
                storeId: store._id,
                storeName: store.title,
                isActive: true,
                position: 1,
              },
            ],
            createdBy: userId,
          },
          {
            title: process.env.DEFAULT_DINING_TITLE_3,
            stores: [
              {
                storeId: store._id,
                storeName: store.title,
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
  const taxesTypeCheck = await taxesType.find({});
  if (taxesTypeCheck.length === 0) {
    try {
      await taxesType
        .create([
          {
            title: "Included in the price",
            createdBy: userId,
          },
          {
            title: "Added to the price",
            createdBy: userId,
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
  const taxesOptionCheck = await taxesOption.find({});

  if (taxesOptionCheck.length === 0) {
    try {
      await taxesOption
        .create([
          {
            title: "Apply the tax to the new items",
            createdBy: userId,
          },
          {
            title: "Apply the tax to existing items",
            createdBy: userId,
          },
          {
            title: "Apply the tax to all new and existing items",
            createdBy: userId,
          },
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
  const paymentTypesCheck = await paymentTypes.find({});
  if (paymentTypesCheck.length === 0) {
    try {
      await paymentTypes
        .create([
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_1,
            createdBy: userId,
          },
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_2,
            createdBy: userId,
          },
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_3,
            createdBy: userId,
          },
          {
            title: process.env.DEFAULT_PAYMENT_TYPES_4,
            createdBy: userId,
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
          console.log("Default Payment Type Create");
        })
        .catch((err) => {
          console.log("Default Payment Type Insert Error", err.message);
        });
    } catch (error) {
      console.log("Default Payment Type Catch Error", error.message);
    }
  }

  // const cash = paymentTypesCheck.filter(
  //   (item) => item.title.toUpperCase() === "Cash".toUpperCase()
  // )[0];
  // const card = paymentTypesCheck.filter(
  //   (item) => item.title.toUpperCase() === "Card".toUpperCase()
  // )[0];
  try {
    await paymentsType
      .create([
        {
          name: process.env.DEFAULT_PAYMENT_TYPE_1,
          paymentType: {
            paymentTypeId: cash._id,
            paymentTypeName: cash.title,
          },
          storeId: paymentTypeStoreId,
          createdBy: userId,
        },
        {
          name: process.env.DEFAULT_PAYMENT_TYPE_2,
          paymentType: {
            paymentTypeId: card._id,
            paymentTypeName: card.title,
          },
          storeId: paymentTypeStoreId,
          createdBy: userId,
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
