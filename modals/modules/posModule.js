import mongoose from "mongoose";

const posModuleSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  description: {
    type: String,
    min: 3,
    max: 255,
  }
},{
  timestamps: true
});

module.exports = mongoose.model("posModule", posModuleSchema);
