// /models/Toner.js
const mongoose = require("mongoose");

const tonerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // ex: "HP 12A"
    brand: { type: String, trim: true }, // ex: "HP"
    model: { type: String, trim: true }, // ex: "Q2612A"
    color: {
      type: String,
      enum: ["black", "cyan", "magenta", "yellow", "other"],
      default: "black",
    },
    sku: { type: String, trim: true, index: true, unique: true, sparse: true },
    minStock: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Toner", tonerSchema);
