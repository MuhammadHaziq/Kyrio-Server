import express from "express";
import Tickets from "../../modals/tickets/tickets";
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { _id } = req.authData;
    var result = await Tickets.find({createdBy: _id}).sort({ _id: "desc" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/:ticket_name', async (req, res) => {

  try {
    const { _id } = req.authData;
    const { ticket_name } = req.query;
    console.log(ticket_name)
    var result = await Tickets.find({ticket_name: ticket_name, createdBy: _id}).sort({ _id: "desc" });
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
router.post('/', async (req, res) => {
    const {ticket_name, comments, total_price, sale, items, variant, store, modifiers, taxes } = req.body;
    var errors = [];
    if (
        !ticket_name ||
        typeof ticket_name == "undefined" ||
        ticket_name == ""
      ) {
        errors.push({ ticket_name: `Invalid ticket_name!` });
      }
    if (
        !total_price ||
        typeof total_price == "undefined" ||
        total_price == ""
      ) {
        errors.push({ total_price: `Invalid Total Price!` });
      }
    if (
        
        typeof items == "undefined" ||
        items.length <= 0 ||
        items == ""
      ) {
        errors.push({ items: `Invalid items!` });
      }
    if (
        typeof store == "undefined" ||
        store == ""
      ) {
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
                created_by: _id
            }).save();
            res.status(200).json(newTickets);

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
});
router.patch('/', async (req, res) => {
    const { ticket_id, ticket_name, comments, total_price, sale, items, variant, store, modifiers, taxes } = req.body;
    var errors = [];
    if (
        !ticket_id ||
        typeof ticket_id == "undefined" ||
        ticket_id == ""
      ) {
        errors.push({ ticket_id: `Invalid Ticket ID!` });
      }
    if (
        !ticket_name ||
        typeof ticket_name == "undefined" ||
        ticket_name == ""
      ) {
        errors.push({ ticket_name: `Invalid ticket_name!` });
      }
      if (
        !total_price ||
        typeof total_price == "undefined" ||
        total_price == ""
      ) {
        errors.push({ total_price: `Invalid Total Price!` });
      }
    if (
        
        typeof items == "undefined" ||
        items.length <= 0 ||
        items == ""
      ) {
        errors.push({ items: `Invalid items!` });
      }
    if (
        typeof store == "undefined" ||
        store == ""
      ) {
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
              created_by: _id
          };
            let result = await Tickets.updateOne(
              { _id: ticket_id },
              data
            );
            res.status(200).json(result);

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
});

module.exports = router;