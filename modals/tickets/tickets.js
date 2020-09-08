import mongoose from "mongoose";

const ticketsSchema = new mongoose.Schema({
  ticket_name: {
    type: String,
    min: 6,
    max: 255,
  },
  comments: {
    type: String,
    min: 6,
    max: 255,
  },
  items: [{
      item_id: {
        type: String,
        min: 6,
        max: 255,
      },
      quantity: {
        type: Number,
        min: 1,
        max: 255,
      },
      refund_quantity: {
        type: Number,
        min: 0,
        max: 255,
      },
  }],
  variant: {
      variant_id: {
        type: String,
        min: 6,
        max: 255,
      },
      title: {
        type: String,
        min: 6,
        max: 255,
      }
    },
  store: {
    store_id: {
        type: String,
        min: 6,
        max: 255,
      },
    name: {
        type: String,
        min: 6,
        max: 255,
      }
  },
  modifiers: [{
      modifier_id: {
        type: String,
        min: 6,
        max: 255,
      },
      name: {
        type: String,
        min: 6,
        max: 255,
      },
      options: [{
        name: {
            type: String,
            min: 6,
            max: 255,
          },
        price: {
            type: Number,
            min: 1,
            max: 255,
          },
      }]
  }],
  taxes: [{
    tax_id: {
        type: String,
        min: 6,
        max: 255,
      },
    name: {
        type: String,
        min: 4,
        max: 255,
      },
  }],
  created_by: {
    type: String,
    min: 6,
    max: 255,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

ticketsSchema.index(
  {
    ticket_name: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("tickets", ticketsSchema);
