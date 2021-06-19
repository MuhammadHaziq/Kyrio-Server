import mongoose from "mongoose";

const featuresSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
  },
  description: {
    type: String,
    min: 3,
    max: 255,
  },
  icon: {
    type: String,
    min: 3,
    max: 255,
  },
},{
  timestamps: true
});

module.exports = mongoose.model("features", featuresSchema);
