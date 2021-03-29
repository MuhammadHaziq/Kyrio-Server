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
  const { catTitle, catColor } = req.body;
  const { _id, accountId } = req.authData;
  const newCat = new Category({
    catTitle: catTitle,
    accountId: accountId,
    catColor: catColor,
    created_by: _id,
  });
  try {
    const newCatResult = await newCat.save();
    req.io.emit(CATEGORY_INSERT, { data: newCatResult, user: _id });
    res.status(201).json(newCatResult);
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
    const { accountId } = req.authData;
    const allCat = await Category.find({
      accountId: accountId,
      deleted: 0,
    }).sort({
      _id: "desc",
    });
    let allCategories = [];
    for (const cate of allCat) {
      let itemCount = await ItemList.find({
        "category.id": cate._id,
        deleted: 0,
      }).countDocuments();
      allCategories.push({
        _id: cate._id,
        catTitle: cate.catTitle,
        catColor: cate.catColor,
        created_at: cate.created_at,
        created_by: cate.created_by,
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
    const { _id, accountId } = req.authData;
    ids = JSON.parse(ids);

    // ids.forEach(async (id) => {
    //   await Category.deleteOne({ _id: id });
    // });

    let del = await Category.updateMany(
      { _id: { $in: ids }, accountId: accountId },
      { $set: { deleted: 1, deleted_at: Date.now() } },
      {
        new: true,
        upsert: true,
      }
    );

    if (del.n > 0 && del.nModified > 0) {
      req.io.emit(CATEGORY_DELETE, { data: ids, user: _id });
    }

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/categoryItem", async (req, res) => {
  const { _id, accountId } = req.authData;
  // Old Quer Work in ModalSelectItemsTax(React)
  // let { categoryFilter, storeId } = req.query;
  // Old Quer Work in UpdateTax(React)
  let { storeId } = req.query;

  try {
    let filters;
    /*
*    if (categoryFilter == undefined && categoryFilter == null && categoryFilter == '') {
    *  filters = {
    *    stores: { $elemMatch: { id: storeId } },
    *    created_by: _id,
    *  };
    *} else {
    *  filters = {
    *    stores: { $elemMatch: { id: storeId } },
          "category.id": categoryFilter,
        created_by: _id,
      };
    }
*
*
    */
    if (storeId === undefined) {
      filters = {
        accountId: accountId,
        deleted: 0,
      };
    } else {
      storeId = JSON.parse(storeId);
      filters = {
        stores: { $elemMatch: { id: { $in: storeId } } },
        accountId: accountId,
        deleted: 0,
      };
    }

    var result = await ItemList.find(filters);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, accountId } = req.authData;
    const { catTitle, catColor } = req.body;
    const result = await Category.findOneAndUpdate(
      { _id: id, accountId: accountId },
      {
        $set: {
          catTitle: catTitle,
          catColor: catColor,
        },
      },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    );
    req.io.emit(CATEGORY_UPDATE, { data: result, user: _id });
    res.status(200).json({ data: result, message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/row/:id", async (req, res) => {
  try {
    const { accountId } = req.authData;
    const { id } = req.params;
    const allCat = await Category.find({
      _id: id,
      accountId: accountId,
      deleted: 0,
    }).sort({
      _id: "desc",
    });
    let allCategories = [];
    for (const cate of allCat) {
      let itemCount = await ItemList.find({
        "category.id": cate._id,
        deleted: 0,
      }).countDocuments();
      allCategories.push({
        _id: cate._id,
        catTitle: cate.catTitle,
        catColor: cate.catColor,
        created_at: cate.created_at,
        created_by: cate.created_by,
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
