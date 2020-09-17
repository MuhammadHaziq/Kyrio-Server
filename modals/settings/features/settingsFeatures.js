import mongoose, { mongo, models } from "mongoose";

const settingsFeaturesSchema = new mongoose.Schema({
  feature_title: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  feature_description: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  stores: {
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
  isActive: {
    type: Boolean,
    default: true,
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

settingsFeaturesSchema.index(
  {
    title: 1,
  },
  {
    unique: true,
  }
);
settingsFeaturesSchema.pre("save", function (next) {
  var doc = this;
  var settingsFeatures = mongoose.model(
    "settingsFeatures",
    settingsFeaturesSchema
  );
  // Only increment when the document is new
  if (this.isNew) {
    settingsFeatures.countDocuments().then((res) => {
      // doc.position = res; // Increment count
      doc.isActive = false;
      next();
    });
  } else {
    next();
  }
});

module.exports = mongoose.model("settingsFeatures", settingsFeaturesSchema);
