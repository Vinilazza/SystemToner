const User = require("../models/User");
const { verifyAccess } = require("../utils/jwt");

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer "))
      return res.status(401).json({ success: false, error: "Não autenticado" });

    const token = auth.split(" ")[1];
    const decoded = verifyAccess(token);

    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive)
      return res
        .status(401)
        .json({ success: false, error: "Usuário inválido/inativo" });
    if (user.changedPasswordAfter(decoded.iat)) {
      return res
        .status(401)
        .json({ success: false, error: "Token inválido (senha alterada)" });
    }
    req.user = user;
    next();
  } catch (e) {
    return res
      .status(401)
      .json({ success: false, error: "Token inválido ou expirado" });
  }
}

function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ success: false, error: "Não autenticado" });
    if (!allowed.includes(req.user.role))
      return res.status(403).json({ success: false, error: "Sem permissão" });
    next();
  };
}

module.exports = { requireAuth, requireRole };
