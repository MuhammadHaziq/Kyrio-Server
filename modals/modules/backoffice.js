import mongoose from "mongoose";

const backofficeSchema = new mongoose.Schema({
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    handle: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    description: {
      type: String,
      min: 3,
      max: 255,
    },
    isMenu: Boolean,
    isChild: Boolean,
},{
  timestamps: true
});

module.exports = mongoose.model("backoffice", backofficeSchema);
