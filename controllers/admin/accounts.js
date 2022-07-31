import express from "express";
import Accounts from "../../modals/accounts";
import Users from "../../modals/users";
import Store from "../../modals/Store";
import { pagination } from "../../libs/middlewares";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log(req);
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
      res.status(200).json({ data, meta: result.meta });
    } else if (status === "error") {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const populate = [
      {
        path: "role",
        select: "title",
      },
      {
        path: "account",
        select: "businessName",
      },
      {
        path: "createdBy",
        select: "name",
      },
      {
        path: "owner_id",
        select: "name",
      },
      {
        path: "stores",
        select: "title",
      },
    ];
    const { status, result } = await pagination(Users, req, {}, populate);

    if (status === "ok") {
      res.status(200).json({ data: result.data, meta: result.meta });
    } else if (status === "error") {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
router.get("/stores", async (req, res) => {
  try {
    const populate = [
      {
        path: "account",
        select: "businessName",
      },
      {
        path: "createdBy",
        select: "name",
      },
    ];
    const { status, result } = await pagination(Store, req, {}, populate);

    if (status === "ok") {
      res.status(200).json({ data: result.data, meta: result.meta });
    } else if (status === "error") {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

module.exports = router;
