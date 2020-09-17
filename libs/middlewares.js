import Users from "../modals/users";
import Modules from "../modals/modules";
import Role from "../modals/role";
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
              Role.findOne({
                roleName: "Owner",
              })
                .then((roleData) => {
                  if (roleData != null) {
                    req.body.role_id = roleData._id;
                    req.body.roleName = "Owner";
                    next();
                  } else {
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
                  }
                })
                .catch((err) => {
                  res.status(403).send({
                    type: "server",
                    message: `Unable to find Role ${err.message}`,
                  });
                });
            } else {
              let modules = new Modules(modulesData);
              modules
                .save()
                .then((insertedRecord) => {
                  Role.findOne({
                    roleName: "Owner",
                  })
                    .then((roleData) => {
                      if (roleData != null) {
                        req.body.role_id = roleData._id;
                        req.body.roleName = "Owner";
                        next();
                      } else {
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
                      }
                    })
                    .catch((err) => {
                      res.status(403).send({
                        message: `Unable to find Role ${err.message}`,
                      });
                    });
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
