import express from "express";
import Accounts from "../../../modals/accounts";
import { FEATURES_TOGGLE } from "../../../sockets/events";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { account } = req.authData;
    let accountFeature  = await Accounts.findOne({ _id: account }).populate('features.feature',["_id","title","handle","description","icon"]).populate('settings.module',["_id","title","handle","icon","heading","span"]).populate('settings.feature',["_id","title","handle","description","icon"]);

    res
      .status(200)
      .json(accountFeature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/app", async (req, res) => {
  try {
    const { account } = req.authData;
    let accountFeature  = await Accounts.findOne({ _id: account }).populate('features.feature',["_id","title","handle","description","icon"]);
    let features = []
    for(const ft of accountFeature.features){
      features.push({
        _id: ft.feature._id,
        title: ft.feature.title,
        handle: ft.feature.handle,
        enable: ft.enable
      })
    }
    res
      .status(200)
      .json(features);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/", async (req, res) => {
  try {
    const { account, _id } = req.authData;
    const { features, settings } = req.body;

    if (typeof features === "undefined" || features.length <= 0) {
      res.status(400).json({ message: "Feature Id Not Empty", errors: [] });
    }
    let filterFeatures = features.map(feature => {
      return {
        _id: feature._id,
        feature: feature.featureId,
        enable: feature.enable
      }
    })
    let accountFeature  = await Accounts.findOneAndUpdate(
      { _id: account },
      { $set: {
        features: filterFeatures,
        settings: settings
        } 
      },
      {
        new: true,
        upsert: true
      }
    ).populate('features.feature',["_id","title","handle","description","icon"]).populate('settings.module',["_id","title","handle","icon","heading","span"]).populate('settings.feature',["_id","title","handle","description","icon"]);
      if(accountFeature){
        let featuresArr = []
        for(const ft of accountFeature.features){
          featuresArr.push({
            _id: ft.feature._id,
            title: ft.feature.title,
            handle: ft.feature.handle,
            enable: ft.enable
          })
        }
        req.io.to(account).emit(FEATURES_TOGGLE, { app: featuresArr, backoffice: accountFeature, settings: settings, user: _id, account: account });
      }
    res
      .status(200)
      .json(accountFeature );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
