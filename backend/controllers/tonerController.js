// /controllers/tonerController.js
const Toner = require("../models/Toner");
const StockMovement = require("../models/StockMovement");

exports.create = async (req, res) => {
  const data = await Toner.create(req.body);
  return res.status(201).json({ success: true, data });
};

exports.list = async (req, res) => {
  const { q, page = 1, limit = 20, onlyActive, lowStock } = req.query;
  const filter = {};
  if (onlyActive === "true") filter.isActive = true;
  if (q)
    filter.$or = [
      { name: new RegExp(q, "i") },
      { brand: new RegExp(q, "i") },
      { model: new RegExp(q, "i") },
      { sku: new RegExp(q, "i") },
    ];
  if (lowStock === "true")
    filter.$expr = { $lt: ["$currentStock", "$minStock"] };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Toner.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Toner.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: {
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit) || 1),
    },
  });
};

exports.get = async (req, res) => {
  const item = await Toner.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, error: "Toner não encontrado" });
  res.json({ success: true, data: item });
};

exports.update = async (req, res) => {
  const item = await Toner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!item)
    return res
      .status(404)
      .json({ success: false, error: "Toner não encontrado" });
  res.json({ success: true, data: item });
};

exports.toggleActive = async (req, res) => {
  const item = await Toner.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, error: "Toner não encontrado" });
  item.isActive = !item.isActive;
  await item.save();
  res.json({ success: true, data: item });
};

exports.history = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    StockMovement.find({ toner: req.params.id })
      .populate("user", "name email role")
      .populate("relatedPrinter", "name location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    StockMovement.countDocuments({ toner: req.params.id }),
  ]);
  res.json({
    success: true,
    data: {
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit) || 1),
    },
  });
};
