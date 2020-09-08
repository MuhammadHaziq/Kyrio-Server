import express from "express";
import Tickets from "../../modals/tickets/tickets";
const router = express.Router();

router.post('/create', async (req, res) => {
    const {ticket_name, comments, items, variant, store, modifiers, taxes } = req.body;
    var errors = [];
    if (
        !ticket_name ||
        typeof ticket_name == "undefined" ||
        ticket_name == ""
      ) {
        errors.push({ ticket_name: `Invalid ticket_name!` });
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

module.exports = router;