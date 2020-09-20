import mongoose from "mongoose";

const ticketsSchema = new mongoose.Schema({
  ticket_name: {
    type: Array,
    required: true,
  },
  comments: {
    type: String,
    min: 6,
    max: 255,
  },
  store: {
      id: {
        type: String,
        min: 6,
        max: 255,
        required: true,
      },
    name: {
        type: String,
        min: 6,
        max: 255,
        required: true,
      }
  },
  created_by: {
    type: String,
    min: 6,
    max: 255,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_by: {
    type: String,
    min: 6,
    max: 255,
  },
  updated_at: {
    type: Date
  },
});

// ticketsSchema.index(
//   {
//     ticket_name: 1,
//   },
//   {
//     unique: true,
//   }
// );

module.exports = mongoose.model("tickets", ticketsSchema);