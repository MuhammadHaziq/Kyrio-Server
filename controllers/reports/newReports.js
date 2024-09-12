import express from "express";
import Sales from "../../modals/sales/sales";
// import ItemList from "../../modals/items/ItemList";
// import Users from "../../modals/users";
// import Shifts from "../../modals/employee/shifts";
// import _, { groupBy, orderBy, slice, isEmpty, sumBy } from "lodash";
import { filterSales } from "../../function/globals";
import dateformat from "dateformat";
const router = express.Router();

router.post("/summary", async (req, res) => {
  try {
    const { startDate, endDate, stores, employees, divider, matches } =
      req.body;
    const { account, decimal } = req.authData;

    var start = dateformat(startDate, "yyyy-mm-dd");
    var end = dateformat(endDate, "yyyy-mm-dd");
    start = start + " 00:00:00";
    end = end + " 23:59:59";

    var sales = await Sales.find({
      $and: [
        { created_at: { $gte: start, $lte: end } },
        { account: account },
        { open: false },
        { cancelled_at: null },
        { "store._id": { $in: stores } },
        { created_by: { $in: employees } },
      ],
    });
    let report = await filterSales(sales, divider, matches, decimal);

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
