import express from "express";
import Category from "../../modals/items/category";
import ItemList from "../../modals/items/ItemList";
const router = express.Router();

router.post("/", async (req, res) => {
  const { catTitle, catColor } = req.body;
  const { _id } = req.authData;
  const newCat = new Category({
    catTitle: catTitle,
    catColor: catColor,
    createdBy: _id,
  });
  try {
    const newCatResult = await newCat.save();
    res.status(201).json(newCatResult);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Category Already Register" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    const allCat = await Category.find({ createdBy: _id }).sort({
      _id: "desc",
    });
    let allCategories = [];
    for (const cate of allCat) {
      let itemCount = await ItemList.find({
        "category.id": cate._id,
      }).countDocuments();
      allCategories.push({
        _id: cate._id,
        catTitle: cate.catTitle,
        catColor: cate.catColor,
        created: cate.created,
        createdBy: cate.createdBy,
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
    ids = JSON.parse(ids);
    ids.forEach(async (id) => {
      await Category.deleteOne({ _id: id });
    });

    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/categoryItem", async (req, res) => {
  const { _id } = req.authData;
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
    *    createdBy: _id,
    *  };
    *} else {
    *  filters = {
    *    stores: { $elemMatch: { id: storeId } },
          "category.id": categoryFilter,
        createdBy: _id,
      };
    }
*
*
    */
    if (storeId === undefined) {
      filters = {
        createdBy: _id,
      };
    } else {
      storeId = JSON.parse(storeId);
      filters = {
        stores: { $elemMatch: { id: { $in: storeId } } },
        createdBy: _id,
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
    const { catTitle, catColor } = req.body;
    await Category.updateOne(
      { _id: id },
      {
        $set: {
          catTitle: catTitle,
          catColor: catColor,
        },
      }
    );

    res.status(200).json({ message: "updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
