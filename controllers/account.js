import express from "express";
import Accounts from "../modals/accounts";
import Users from "../modals/users";
import md5 from "md5";
const router = express.Router();

router.get("/getAccountInfo", async (req, res) => {
  try {
    const { account } = req.authData;
    const result = await Accounts.findOne({ _id: account }).select(["businessName","email","password","timezone","language","decimal"])
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/checkPassword", async (req, res) => {
  try {
    const { password } = req.body;
    const { account } = req.authData;
    const result = await Accounts.findOne({ _id: account, password: md5(password) }).select(["businessName","email","password","timezone","language","decimal"])
    if(result){
        res.status(200).json({passwordCorrect: "YES"});
    } else {
        res.status(200).json({passwordCorrect: "NO", message: "Wrong password"});
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/changeOwnerEmail", async (req, res) => {
  try {
    const { email } = req.body;
    const { owner_id, account } = req.authData;
    const result = await Accounts.findOneAndUpdate({ _id: account }, { $set: { email: email } })
    if(result){
        await Users.updateOne(
            { _id: owner_id, account: account },
            { email: email}
          );
        res.status(200).json({status: true, email: email});
    } else {
        res.status(200).json({status: false, email: ''});
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/changeOwnerPassword", async (req, res) => {
  try {
    const { password } = req.body;
    const { owner_id, account } = req.authData;
    const result = await Accounts.findOneAndUpdate({ _id: account }, { $set: { password: md5(password) } })
    if(result){
        await Users.updateOne(
            { _id: owner_id, account: account },
            { password: md5(password)}
          );
        res.status(200).json({status: true});
    } else {
        res.status(200).json({status: false});
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/setAccountInfo", async (req, res) => {
  try {
    const { businessName, timezone, language } = req.body;
    const { account } = req.authData;
    const result = await Accounts.findOneAndUpdate({ _id: account }, { $set: { 
        businessName: businessName,
        timezone: timezone,
        language: language
    } });
    if(result){
        let data = {
            status: true,
            businessName,
            timezone,
            language
        }
        res.status(200).json(data);
    } else {
        res.status(200).json({status: false});
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
