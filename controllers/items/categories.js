import express from "express";
import Category from "../../modals/items/category";
import ItemList from "../../modals/items/ItemList";
import {
  CATEGORY_INSERT,
  CATEGORY_UPDATE,
  CATEGORY_DELETE,
} from "../../sockets/events";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, color } = req.body;
  const { _id, account } = req.authData;
  try {
    let category = await Category.findOne({
      title: title,
      account: account,
      deleted: 0,
    });

    if (!category) {
      const newCat = new Category({
        title: title,
        account: account,
        color: color,
        created_by: _id,
      });
      const newCatResult = await newCat.save();
      req.io
        .to(account)
        .emit(CATEGORY_INSERT, { data: newCatResult, user: _id });
      res.status(200).json(newCatResult);
    } else {
      res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }
  } catch (error) {
    if (error.code === 11000) {
      res
        .status(400)
        .json({ message: "Category with this name already exists" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.get("/", async (req, res) => {
  try {
    const { account, platform } = req.authData;
    const { update_at } = req.query;
    const filter = {
      account: account,
      deleted: 0,
    };
    let isoDate = new Date(update_at);
    if (platform === "pos") {
      filter.updatedAt = { $gte: isoDate };
    }
    const allCat = await Category.find(filter).sort({
      title: 1,
    });

    let allCategories = [];
    for (const cate of allCat) {
      let itemCount = await ItemList.find({
        category: cate._id,
        deleted: 0,
      }).countDocuments();
      allCategories.push({
        _id: cate._id,
        account: cate.account,
        title: cate.title,
        color: cate.color,
        createdBy: cate.createdBy,
        createdAt: cate.createdAt,
        updatedAt: cate.updatedAt,
        total_items: itemCount,
      });
    }

    res.status(200).json(allCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:ids", async (req, res) => {
  try {
    var { ids } = req.params;
    const { _id, account } = req.authData;
    ids = JSON.parse(ids);

    // ids.forEach(async (id) => {
    //   await Category.deleteOne({ _id: id });
    // });

    let del = await Category.updateMany(
      { _id: { $in: ids }, account: account },
      { $set: { deleted: 1, deletedAt: Date.now() } },
      {
        new: true,
        upsert: true,
      }
    );

    if (del.n > 0 && del.nModified > 0) {
      req.io.to(account).emit(CATEGORY_DELETE, { data: ids, user: _id });
    }

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/categoryItem", async (req, res) => {
  const { _id, account } = req.authData;
  let { stores } = req.query;

  try {
    let filters;
    if (stores === undefined) {
      filters = {
        account: account,
        deleted: 0,
      };
    } else {
      filters = {
        stores: { $elemMatch: { store: { $in: stores } } },
        account: account,
        deleted: 0,
      };
    }

    var result = await ItemList.find(filters)
      .sort({
        title: 1,
      })
      .populate("category", ["_id", "title"]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/", async (req, res) => {
  try {
    const { _id, account } = req.authData;
    const { id, title, color } = req.body;
    let category = await Category.findOne({
      _id: { $ne: id },
      title: title,
      account: account,
      deleted: 0,
    });
    if (!category) {
      const result = await Category.findOneAndUpdate(
        { _id: id, account: account },
        {
          $set: {
            title: title,
            color: color,
          },
        },
        {
          new: true,
          upsert: true, // Make this update into an upsert
        }
      );
      req.io.to(account).emit(CATEGORY_UPDATE, { data: result, user: _id });
      res.status(200).json(result);
    } else {
      res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/row/:id", async (req, res) => {
  try {
    const { account } = req.authData;
    const { id } = req.params;
    const allCat = await Category.find({
      _id: id,
      account: account,
      deleted: 0,
    }).sort({
      title: 1,
    });
    let allCategories = [];
    for (const cate of allCat) {
      let itemCount = await ItemList.find({
        "category.id": cate._id,
        deleted: 0,
      }).countDocuments();
      allCategories.push({
        _id: cate._id,
        title: cate.title,
        color: cate.color,
        createdBy: cate.created_by,
        total_items: itemCount,
      });
    }
    if (allCategories.length > 0) {
      allCategories = allCategories[0];
    } else {
      allCategories = {};
    }
    res.status(200).json(allCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
