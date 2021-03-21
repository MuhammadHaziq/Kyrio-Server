import mongoose, { mongo, models } from "mongoose";

const modifierSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  accountId: {
    type: String,
    min: 6,
    max: 255,
    required: true
  },
  type: {
    type: String,
    min: 3,
    max: 255,
  },
  options: [
    {
      name: {
        type: String,
        min: 3,
        max: 255,
        required: true,
      },
      price: {
        type: Number,
        max: 100000000000,
        required: true,
      },
      position: {
        type: Number,
        default: 0,
      },
    },
  ],
  stores: [
    {
      id: {
        type: String,
        min: 1,
        max: 255,
        required: true,
      },
      name: {
        type: String,
        min: 1,
        max: 255,
        required: true,
      },
    },
  ],
  position: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  created_by: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
  deleted: {
    type: Number,
    max: 1,
    default: 0
  },
  deleted_at: {
      type: Date,
      default: Date.now(),
  },
});
modifierSchema.pre("save", function (next) {
  var doc = this;
  var modifierSchema = mongoose.model("modifier", modifierSchema);
  // Only increment when the document is new
  if (this.isNew) {
    modifierSchema.countDocuments().then((res) => {
      doc.position = res;
      // Increment count
      // doc.isActive = true;
      next();
    });
  } else {
    next();
  }
});
module.exports = mongoose.model("modifier", modifierSchema);
