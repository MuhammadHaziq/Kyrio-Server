import express from "express";
import Tickets from "../../modals/sales/tickets";
const router = express.Router();

router.get("/:storeid", async (req, res) => {
  try {
    var { storeid } = req.body;
    var result = await Tickets.find({"store.id": storeid}).sort({ _id: "desc" });
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
  const {
    ticket_name,
    comments,
    store,
  } = req.body;
  
  var errors = [];
  if (typeof ticket_name == "undefined" || ticket_name.length <= 0) {
    errors.push({ ticket_name: `Invalid tickets!` });
  }
  if (typeof store == "undefined" || store == "") {
    errors.push({ store: `Invalid store!` });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id } = req.authData;
    try {
      const newTickets = await new Tickets({
        ticket_name: ticket_name,
        comments: comments,
        store: store,
        created_by: _id,
      }).save();
      res.status(200).json({message: "Ticket Successfully Added!", newTickets});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/getStoreTicket/:storeId", async (req, res) => {
  try {
    var { storeId } = req.params;
    var result = await Tickets.find({
      "store.id": storeId,
    }).sort({ _id: "desc" });
    res.status(200).json(result);
    let itemList = [];
    let newTicket = [];
    new Promise((resolve, reject) => {
      result.map((item, index) => {
        return itemList.push({
          id: `item-${index + 1}`,
          value: item.ticket_name,
        });
      });

      resolve();
    })
      .then((response) => {
        let values = itemList.map((itm) => {
          return itm.value;
        });
        const data = {
          values,
          items: itemList,
        };
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(400).json({ message: error.message });
      });
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
  const {
    ticket_id,
    ticket_name,
    comments,
    store,
  } = req.body;
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
    const { _id } = req.authData;
    try {
      let data = {
        ticket_name: ticket_name,
        comments: comments,
        store: store,
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
