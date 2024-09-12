import mongoose, { mongo, models } from "mongoose";

const diningOptionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      min: 3,
      max: 255,
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    stores: [
      {
        store: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        position: {
          type: Number,
          default: 0,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

diningOptionSchema.index(
  {
    title: 1,
    // createdBy: 1,
    account: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);
// diningOptionSchema.pre("save", function (next) {
//   var doc = this;
//   var diningOption = mongoose.model("diningOption", diningOptionSchema);
//   // Only increment when the document is new
//   if (this.isNew) {
//     diningOption.countDocuments().then((res) => {
//       console.log(doc);
//       console.log(res);
//       // doc.position = res;
//        // Increment count
//       // doc.isActive = true;
//       next();
//     });
//   } else {
//     next();
//   }
// });
// isActive: {
//   type: Boolean,
//   default: true,
// },
module.exports = mongoose.model("diningOption", diningOptionSchema);
