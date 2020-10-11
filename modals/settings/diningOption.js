import mongoose, { mongo, models } from "mongoose";

const diningOptionSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  stores: {
    type: [
      {
        storeId: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
        storeName: {
          type: String,
          min: 3,
          max: 255,
          required: true,
        },
      },
    ],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  position: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
});

diningOptionSchema.index(
  {
    title: 1,
    createdBy: 1,
  },
  {
    unique: true,
  }
);
diningOptionSchema.pre("save", function (next) {
  var doc = this;
  var diningOption = mongoose.model("diningOption", diningOptionSchema);
  // Only increment when the document is new
  if (this.isNew) {
    diningOption.countDocuments().then((res) => {
      doc.position = res; // Increment count
      doc.isActive = true;
      next();
    });
  } else {
    next();
  }
});

module.exports = mongoose.model("diningOption", diningOptionSchema);
