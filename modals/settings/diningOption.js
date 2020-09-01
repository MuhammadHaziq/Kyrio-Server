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
  position: {
    type: Number,
    default: 1,
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
  },
  {
    unique: true,
  }
);
// const diningOption = mongoose.model("diningOption", diningOptionSchema);
// diningOptionSchema.pre("save", function (next) {
//   var doc = this;
//
//   //Retrieve last value of caseStudyNo
//   diningOption.findOne({}, {}, { sort: { position: -1 } }, function (error, counter) {
//     //if documents are present in collection then it will increament caseStudyNo
//     // else it will create a new documents with default values
//
//     if (counter) {
//       counter.position++;
//       doc.position = counter.position;
//     }
//     next();
//   });
// });
// var diningOption = mongoose.model("diningOption", diningOptionSchema);
// diningOptionSchema.pre("save", function (next) {
//   var doc = this;
//   diningOption.findByIdAndUpdate(
//     { _id: "entityId" },
//     { $inc: { position: 1 } },
//     function (error, res) {
//       if (error) return next(error);
//       doc.position = res.position  ;
//       next();
//     }
//   );
// });
module.exports = mongoose.model("diningOption", diningOptionSchema);
