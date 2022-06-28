import express from "express";
import Accounts from "../../modals/accounts";
import Users from "../../modals/users";
import { pagination } from "../../libs/middlewares";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { status, result } = await pagination(Accounts, req, {});

    if (status === "ok") {
      let data = [];

      for (const account of result.data) {
        let totalUsers = await Users.find({
          account: account._id,
        }).countDocuments();
        data.push({
          _id: account._id,
          businessName: account.businessName,
          decimal: account.decimal,
          timeFormat: account.timeFormat,
          dateFormat: account.dateFormat,
          totalUsers: totalUsers,
          createdAt: account.createdAt,
        });
      }
      res
        .status(200)
        .json({ data, meta: result.meta });
    } else if (status === "error") {
      res.status(500).json({ message: response.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
