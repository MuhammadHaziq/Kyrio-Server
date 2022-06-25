import express from "express";
import Accounts from "../../modals/accounts";
import Users from "../../modals/users";
import { paginate } from "../../libs/middlewares";
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const { status, result } = await paginate(Accounts, req, {});

    if (status === "ok") {
      let data = [];

      for (const account of result.results) {
        let totalUsers = await Users.find({
          account: account._id,
        }).countDocuments();
        data.push({
          _id: account._id,
          businessName: account.businessName,
          decimal: account.decimal,
          timeFormat: account.timeFormat,
          dateFormat: account.dateFormat,
          createdAt: account.createdAt,
          totalUsers: totalUsers,
        });
      }
      res
        .status(200)
        .json({ next: result.next, previous: result.previous, data });
    } else if (status === "error") {
      res.status(500).json({ message: response.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
