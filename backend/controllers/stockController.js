// /controllers/stockController.js
const mongoose = require("mongoose");
const Toner = require("../models/Toner");
const StockMovement = require("../models/StockMovement");

/**
 * Aplica uma movimentação de estoque em transação:
 * - in: soma quantidade
 * - out: subtrai (valida estoque suficiente)
 * - adjust: define estoque absoluto (>= 0)
 */
async function applyMovement({
  tonerId,
  type,
  quantity,
  note,
  relatedPrinter,
  userId,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const toner = await Toner.findById(tonerId)
      .session(session)
      .setOptions({ sanitizeFilter: true });
    if (!toner) throw new Error("Toner não encontrado");

    // valida tipo
    const allowed = new Set(["in", "out", "adjust"]);
    if (!allowed.has(type))
      throw new Error("Tipo de movimento inválido (use: in | out | adjust)");

    // valida quantidade
    const q = Number(quantity);
    if (!Number.isFinite(q)) throw new Error("Quantidade inválida");

    if (type === "in") {
      if (q <= 0) throw new Error("Quantidade deve ser > 0 para entrada");
      toner.currentStock += q;
    } else if (type === "out") {
      if (q <= 0) throw new Error("Quantidade deve ser > 0 para saída");
      if (toner.currentStock - q < 0) throw new Error("Estoque insuficiente");
      toner.currentStock -= q;
    } else {
      // adjust (absoluto): permite 0
      if (q < 0) throw new Error("Quantidade deve ser >= 0 para ajuste");
      toner.currentStock = q;
    }

    await toner.save({ session });

    const [movement] = await StockMovement.create(
      [
        {
          toner: tonerId,
          type,
          quantity: q,
          note,
          relatedPrinter: relatedPrinter || undefined,
          user: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return { toner, movement };
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }
}

const createMovement = async (req, res) => {
  try {
    const { tonerId, type, quantity, note, relatedPrinter } = req.body;
    const result = await applyMovement({
      tonerId,
      type,
      quantity,
      note,
      relatedPrinter,
      userId: req.user._id,
    });
    return res.status(201).json({ success: true, data: result });
  } catch (e) {
    return res.status(400).json({ success: false, error: e.message });
  }
};

const listMovements = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, type, tonerId, printerId } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (tonerId) filter.toner = tonerId;
    if (printerId) filter.relatedPrinter = printerId;
    if (q) filter.note = new RegExp(q, "i");

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      StockMovement.find(filter)
        .populate("toner", "name model sku")
        .populate("user", "name email")
        .populate("relatedPrinter", "name location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      StockMovement.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        pages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (e) {
    return res.status(400).json({ success: false, error: e.message });
  }
};

module.exports = { createMovement, listMovements };
