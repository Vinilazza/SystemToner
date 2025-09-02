// Endpoints de dados para o frontend (compacto) e para "perfil" (detalhado)
exports.getMeCompact = async (req, res) => {
  return res.json({ success: true, data: req.user.toCompact() });
};

exports.getMeProfile = async (req, res) => {
  return res.json({ success: true, data: req.user.toProfile() });
};

// (opcional) pegar perfil de outro usuário (admin)
const User = require("../models/User");
exports.getUserProfileById = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user)
    return res
      .status(404)
      .json({ success: false, error: "Usuário não encontrado" });
  return res.json({ success: true, data: user.toProfile() });
};
