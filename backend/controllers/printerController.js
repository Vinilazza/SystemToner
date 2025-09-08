// /controllers/printerController.js
const Printer = require("../models/Printer");

exports.create = async (req, res) => {
  const data = await Printer.create(req.body);
  return res.status(201).json({ success: true, data });
};

exports.list = async (req, res) => {
  const { q, page = 1, limit = 20, onlyActive } = req.query;
  const filter = {};
  if (onlyActive === "true") filter.isActive = true;
  if (q)
    filter.$or = [
      { name: new RegExp(q, "i") },
      { brand: new RegExp(q, "i") },
      { model: new RegExp(q, "i") },
      { location: new RegExp(q, "i") },
      { ip: new RegExp(q, "i") },
    ];
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Printer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Printer.countDocuments(filter),
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
  const item = await Printer.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, error: "Impressora não encontrada" });
  res.json({ success: true, data: item });
};

exports.update = async (req, res) => {
  const item = await Printer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!item)
    return res
      .status(404)
      .json({ success: false, error: "Impressora não encontrada" });
  res.json({ success: true, data: item });
};

exports.toggleActive = async (req, res) => {
  const item = await Printer.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, error: "Impressora não encontrada" });
  item.isActive = !item.isActive;
  await item.save();
  res.json({ success: true, data: item });
};
