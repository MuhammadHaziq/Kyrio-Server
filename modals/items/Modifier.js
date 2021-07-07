import mongoose from "mongoose";

const modifierSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 3,
    max: 255,
    required: true,
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
  position: {
    type: Number,
    default: 0,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },
  stores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  deleted: {
    type: Number,
    max: 1,
    default: 0
  },
  deletedAt: {
      type: Date,
      default: Date.now(),
  },
},{
  timestamps: true
});
modifierSchema.index(
  {
      title: 1,
  },
  {
      unique: true,
      sparse: true
  }
);
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
