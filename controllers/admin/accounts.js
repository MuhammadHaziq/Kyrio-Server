import express from "express";
import Accounts from "../../modals/accounts";
import Users from "../../modals/users";
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

module.exports = router;
