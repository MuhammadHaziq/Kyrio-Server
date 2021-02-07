import express from "express";
import Tickets from "../../modals/sales/tickets";
const router = express.Router();

router.get("/:storeid", async (req, res) => {
  try {
    var { storeid } = req.body;

    var result = await Tickets.find({ "store.id": storeid }).sort({
      _id: "desc",
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    var { id } = req.params;
    let result = await Tickets.deleteOne({ _id: id });

    res.status(200).json({ message: "deleted", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/saveOpenTicket", async (req, res) => {
  const { ticket_name, comments, store } = req.body;

  var errors = [];
  if (typeof ticket_name == "undefined" || ticket_name.length <= 0) {
    errors.push({ ticket_name: `Invalid tickets!` });
  }
  if (typeof store == "undefined" || store == "" || store == null || store == {}) {
    errors.push({ store: `Invalid store!` });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id, accountId } = req.authData;
    try {
      if(Object.keys(store).length !== 0 && store.constructor === Object){
      const newTickets = await new Tickets({
        ticket_name: ticket_name,
        comments: comments,
        store: store,
        created_by: _id,
        accountId: accountId
      }).save();
      res
        .status(200)
        .json({ message: "Ticket Successfully Added!", newTickets });
      } else {
        res.status(400).json({ message: "Store is not selected" });  
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/getStoreTicket/:storeId", async (req, res) => {
  try {
    var { storeId } = req.params;
    const { accountId } = req.authData;
    let filters = {}
    if(storeId === '0') {
      filters.accountId = accountId
    }else {
      filters.store['id'] = storeId
      filters.accountId = accountId
    }
    // var result = await Tickets.findOne({
    //   "store.id": storeId,
    // }).sort({ _id: "desc" });
    var result = await Tickets.findOne(filters).sort({ _id: "desc" });
    let itemList = [];
    let newTicket = [];
    if (result !== null) {
      await new Promise((resolve, reject) => {
        result.ticket_name.map((item, index) => {
          return itemList.push({
            id: `item-${index + 1}`,
            value: item,
          });
        });

        resolve(itemList);
      })
        .then((response) => {
          let values = response.map((itm) => {
            return itm.value;
          });
          let errors = response.map((item) => {
            return false;
          });
          const data = {
            values,
            items: response,
            errors,
            checked: true,
          };
          res.status(200).json({ data });
        })
        .catch((err) => {
          res.status(400).json({ message: error.message });
        });
    } else {
      const data = {
        values: [],
        items: [],
        errors: [],
        checked: false,
      };
      res.status(200).json({ message: "No Record Found", data });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/*
 *
 * End Created By Muhammad Haziq For Web Sttings => Open Ticket Save
 *
 *
 */
router.patch("/", async (req, res) => {
  const { ticket_id, ticket_name, comments, store } = req.body;
  var errors = [];
  if (!ticket_id || typeof ticket_id == "undefined" || ticket_id == "") {
    errors.push({ ticket_id: `Invalid Ticket ID!` });
  }
  if (typeof ticket_name == "undefined" || ticket_name.length <= 0) {
    errors.push({ ticket_name: `Invalid tickets!` });
  }
  if (typeof store == "undefined" || store == "") {
    errors.push({ store: `Invalid store!` });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id, accountId } = req.authData;
    try {
      let data = {
        ticket_name: ticket_name,
        comments: comments,
        store: store,
        accountId: accountId,
        updated_by: _id,
        updated_at: Date.now()
      };
      let result = await Tickets.updateOne({ _id: ticket_id }, data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
