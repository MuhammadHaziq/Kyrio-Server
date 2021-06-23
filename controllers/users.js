import Users from "../modals/users";
import Role from "../modals/role";
import Stores from "../modals/Store";
import Accounts from "../modals/accounts";
import Modules from "../modals/modules/modules";
import { checkModules, addModuleWhenSignUp } from "../libs/middlewares";
import md5 from "md5";
import express from "express";
import jwt from "jsonwebtoken";
// import sendEmail from "../libs/sendEmail";

var router = express.Router();

router.post("/testapi", async (req, res) => {
  const { param } = req.body;
//  let accountResult = await Accounts.findOne({ _id: param }).populate('features.feature',["_id","name","description","icon"]).populate('settings.module',["_id","name","icon","heading","span"]).populate('settings.feature',["_id","name","description","icon"])
//         res.status(200).send(accountResult);
        let userResult = await Users.findOne({ _id: param }).populate({ 
          path: 'role', 
          populate : [{
              path: 'allowBackoffice.modules.backoffice',
              select: ["_id","name","isMenu","isChild"]
            },
            {
              path: 'allowPOS.modules.posModule',
              select: ["_id","name","description"]
            }]
          })
          .populate('stores',['_id','title'])
          .populate({
          path : 'account',
          populate : [{
              path: 'features.feature',
              select: ["_id","name","description","icon"]
            },
            {
              path: 'settings.module',
              select: ["_id","name","icon","heading","span"]
            },
            {
              path: 'settings.feature',
              select: ["_id","name","description","icon"]
            }]
          });
        res.status(200).send(userResult);

})
router.post("/signup", checkModules, async (req, res) => {
  try {
    const { email, password, businessName, country, role_id, UDID, features, settings } = req.body;
    
    let userId = "";
    let roleData = await Role.findOne({ _id: role_id });
    let users = new Users({
      name: roleData.title,
      email: email,
      emailVerified: false,
      password: md5(password),
      country: country,
      role: role_id
    });
    users
      .save()
      .then(async (result) => {
        userId = result._id;
        let moduleResult = await Modules.findOne();

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
                          item.name.toUpperCase() ===
                          itm.name.toUpperCase()
                      ).length > 0
                        ? features
                            .filter(
                              (item) =>
                                item.name.toUpperCase() ===
                                itm.name.toUpperCase()
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
            email: email,
            password: password,
            timezone: null,
            language: "English",
            features: featuresArr,
            settings: settingsArr,
            createdBy: userId,
          }).save();

        let accountResult = await Accounts.findOne({ _id: account._id }).populate('features.feature',["_id","name","description","icon"]).populate('settings.module',["_id","name","icon","heading","span"]).populate('settings.feature',["_id","name","description","icon"])
        
        let store = new Stores({
          title: accountResult.businessName,
          createdBy: result._id,
          account: accountResult._id
        });
        let storeObject = await store.save();
        
        await Users.updateOne(
          { _id: result._id },
          { createdBy: result._id, owner_id: result._id, account: accountResult._id,  stores: [storeObject._id]}
        );
        await Role.updateOne(
          { _id: role_id },
          { user_id: result._id, account: accountResult._id }
        );
        // let userResult = await Users.findOne({ email: email, password: md5(password) }).populate('role').populate('stores',['_id','title']).populate('account')
        let userResult = await Users.findOne({ _id: result._id }).populate({ 
          path: 'role', 
          populate : [{
              path: 'allowBackoffice.modules.backoffice',
              select: ["_id","name","isMenu","isChild"]
            },
            {
              path: 'allowPOS.modules.posModule',
              select: ["_id","name","description"]
            }]
          })
          .populate('stores',['_id','title'])
          .populate({
          path : 'account',
          populate : [{
              path: 'features.feature',
              select: ["_id","name","description","icon"]
            },
            {
              path: 'settings.module',
              select: ["_id","name","icon","heading","span"]
            },
            {
              path: 'settings.feature',
              select: ["_id","name","description","icon"]
            }]
          })
        let user = {
          platform: "backoffice",
          _id: userResult._id,
          name: userResult.name,
          email: userResult.email,
          emailVerified: userResult.emailVerified,
          businessName: userResult.account.businessName,
          country: userResult.country,
          role_id: userResult.role._id,
          stores: userResult.stores,
          createdBy: userResult._id,
          account: userResult.account._id,
          owner_id: userResult.owner_id,
          is_owner: typeof userResult.owner_id !== "undefined" ? true : false,
          posPin: typeof userResult.posPin !== "undefined" ? userResult.posPin : null,
          enablePin: typeof userResult.enablePin !== "undefined" ? userResult.enablePin : null
        };
        

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
            await addModuleWhenSignUp(userId, accountResult._id, storeObject, UDID);
            let storesArray = [];
            storesArray.push(store);
            user.roleData = userResult.role
            user.features = userResult.account.features
            user.settings = userResult.account.settings
            user.UserToken = token;
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
    const { email, password, platform } = req.body;

    // let result = await Users.findOne({ email: email, password: md5(password) }).populate('role').populate('stores',['_id','title']).populate('account')
      let result = await Users.findOne({ email: email, password: md5(password) }).populate({ 
        path: 'role', 
        populate : [{
            path: 'allowBackoffice.modules.backoffice',
            select: ["_id","name","isMenu","isChild"]
          },
          {
            path: 'allowPOS.modules.posModule',
            select: ["_id","name","description"]
          }]
        })
        .populate('stores',['_id','title'])
        .populate({
        path : 'account',
        populate : [{
            path: 'features.feature',
            select: ["_id","name","description","icon"]
          },
          {
            path: 'settings.module',
            select: ["_id","name","icon","heading","span"]
          },
          {
            path: 'settings.feature',
            select: ["_id","name","description","icon"]
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
          let access = true;
          if(platform == "backoffice"){
            if(!result.role.allowBackoffice.enable){
              access = false
            }
          }
          if(access){
            let user = {
              platform: platform,
              _id: result._id,
              name: result.name,
              email: result.email,
              emailVerified: result.emailVerified,
              businessName: result.account.businessName,
              country: result.country,
              role_id: result.role._id,
              stores: result.stores,
              owner_id: typeof result.owner_id !== "undefined" ? result.owner_id : null,
              account: result.account._id,
              is_owner: typeof result.owner_id !== "undefined" ? true : false,
              posPin: typeof result.posPin !== "undefined" ? result.posPin : null,
              enablePin: typeof result.enablePin !== "undefined" ? result.enablePin : null
            };

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
          } else {
            res.status(422).send({
              type: "server",
              message: "You do not have access to backoffice!",
            });
          }
        }
  } catch (err) {
    console.log(err.message)
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
