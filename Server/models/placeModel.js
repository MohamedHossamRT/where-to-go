const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    priceLevel: { type: Number, min: 1, max: 4, required: true },
    name: { type: String, required: true },
    category: { type: [String], index: true },
    ratingsAverage: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.0,
    },
    ratingsQuantity: { type: Number, default: 0 },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    website: String,
    address: String,
    phone: String,

    city: { type: String, required: true, index: true, default: "Alexandria" },
  },
  { timestamps: true }
);

placeSchema.index({ location: "2dsphere" });

const Place = mongoose.model("Place", placeSchema);
module.exports = Place;
