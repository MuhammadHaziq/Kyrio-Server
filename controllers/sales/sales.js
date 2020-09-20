import express from "express";
import Tickets from "../../modals/sales/tickets";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    var result = await Tickets.find({ created_by: _id }).sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:ticket_name", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { ticket_name } = req.query;
    
    var result = await Tickets.find({
      ticket_name: ticket_name,
      created_by: _id,
    }).sort({ _id: "desc" });
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
router.post("/", async (req, res) => {
  const {
    ticket_name,
    comments,
    total_price,
    sale,
    items,
    variant,
    store,
    modifiers,
    taxes,
  } = req.body;
  var errors = [];
  if (!ticket_name || typeof ticket_name == "undefined" || ticket_name == "") {
    errors.push({ ticket_name: `Invalid ticket_name!` });
  }
  if (!total_price || typeof total_price == "undefined" || total_price == "") {
    errors.push({ total_price: `Invalid Total Price!` });
  }
  if (typeof items == "undefined" || items.length <= 0 || items == "") {
    errors.push({ items: `Invalid items!` });
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
        total_price: total_price,
        sale: sale,
        items: items,
        variant: variant,
        store: store,
        modifiers: modifiers,
        taxes: taxes,
        created_by: _id,
      }).save();
      res.status(200).json(newTickets);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
/*
 *
 * Created By Muhammad Haziq For Web Sttings => Open Ticket Save
 *
 *
 */
router.post("/saveOpenTicket", async (req, res) => {
  const { ticket_name, store } = req.body;
  var errors = [];
  if (!ticket_name || typeof ticket_name == "undefined" || ticket_name == "") {
    errors.push({ ticket_name: `Invalid ticket_name!` });
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
        store: store,
        open: true,
        created_by: _id,
      }).save();
      let ticketData = {
        _id: newTickets._id,
        name: newTickets.ticket_name,
        store: newTickets.store.store_id,
        store_name: newTickets.store.name,
        open:  newTickets.open,
      }
      res.status(200).json(ticketData);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/getStoreTicket/:storeId", async (req, res) => {
  try {
    const { _id } = req.authData;
    var { storeId } = req.params;
    var result = await Tickets.find({
      created_by: _id,
      "store.store_id": storeId,
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
        // newTicket = itemList.map((k, index) => ({
        //     id: `item-${index + 1}`,
        //     value: k.value,
        //   }));
        let list = itemList.map((itm) => {
          return false;
        });
        let values = itemList.map((itm) => {
          return itm.value;
        });
        const data = {
          errore: list,
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
    total_price,
    sale,
    items,
    variant,
    store,
    modifiers,
    taxes,
  } = req.body;
  var errors = [];
  if (!ticket_id || typeof ticket_id == "undefined" || ticket_id == "") {
    errors.push({ ticket_id: `Invalid Ticket ID!` });
  }
  if (!ticket_name || typeof ticket_name == "undefined" || ticket_name == "") {
    errors.push({ ticket_name: `Invalid ticket_name!` });
  }
  if (!total_price || typeof total_price == "undefined" || total_price == "") {
    errors.push({ total_price: `Invalid Total Price!` });
  }
  if (typeof items == "undefined" || items.length <= 0 || items == "") {
    errors.push({ items: `Invalid items!` });
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
        total_price: total_price,
        sale: sale,
        items: items,
        variant: variant,
        store: store,
        modifiers: modifiers,
        taxes: taxes,
        created_by: _id,
      };
      let result = await Tickets.updateOne({ _id: ticket_id }, data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
