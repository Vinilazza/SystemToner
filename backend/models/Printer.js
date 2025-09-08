// /models/Printer.js
const mongoose = require("mongoose");

const printerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    location: { type: String, trim: true }, // ex: "Secretaria de Saúde"
    serialNumber: { type: String, trim: true },
    ip: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Printer", printerSchema);
