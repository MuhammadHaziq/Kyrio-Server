import express from "express";
import Accounts from "../../modals/accounts";
import Users from "../../modals/users";
import md5 from "md5";
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const accounts = await Accounts.find()
      .populate("createdBy", ["_id", "name"])
      .select([
        "businessName",
        "decimal",
        "timeFormat",
        "dateFormat",
        "createdAt",
      ]);
    let result = [];
    for (const account of accounts) {
      let totalUsers = await Users.find({
        account: account._id,
      }).countDocuments();
      result.push({
        _id: account._id,
        businessName: account.businessName,
        decimal: account.decimal,
        timeFormat: account.timeFormat,
        dateFormat: account.dateFormat,
        createdAt: account.createdAt,
        totalUsers: totalUsers,
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/checkPassword", async (req, res) => {
  try {
    const { password } = req.body;
    const { _id, account } = req.authData;
    const result = await Users.findOne({
      _id: _id,
      account: account,
      password: md5(password),
    });
    if (result) {
      res.status(200).json({ passwordCorrect: "YES" });
    } else {
      res
        .status(200)
        .json({ passwordCorrect: "NO", message: "Wrong password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/changeOwnerEmail", async (req, res) => {
  try {
    const { email } = req.body;
    const { _id, account } = req.authData;
    const result = await Users.updateOne(
      { _id: _id, account: account },
      { email: email }
    );
    if (result) {
      res.status(200).json({ status: true, email: email });
    } else {
      res.status(200).json({ status: false, email: "" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/changeOwnerPassword", async (req, res) => {
  try {
    const { password } = req.body;
    const { _id, account } = req.authData;
    const result = await Users.updateOne(
      { _id: _id, account: account },
      { password: md5(password) }
    );
    if (result) {
      res.status(200).json({ status: true });
    } else {
      res.status(200).json({ status: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/setAccountInfo", async (req, res) => {
  try {
    const { businessName, timezone, language } = req.body;
    const { is_owner, _id, account } = req.authData;

    if (is_owner) {
      await Accounts.updateOne(
        { _id: account },
        {
          businessName: businessName,
        }
      );
    }
    const result = await Users.updateOne(
      { _id: _id, account: account },
      { timezone: timezone, language: language }
    );
    if (result) {
      let data = {
        status: true,
        businessName,
        timezone,
        language,
      };
      res.status(200).json(data);
    } else {
      res.status(200).json({ status: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
