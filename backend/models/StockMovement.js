// /models/StockMovement.js
const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    toner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Toner",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["in", "out", "adjust"],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, trim: true },
    relatedPrinter: { type: mongoose.Schema.Types.ObjectId, ref: "Printer" }, // para saídas
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockMovement", stockMovementSchema);
