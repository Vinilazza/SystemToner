// /controllers/userController.js
const mongoose = require("mongoose");
const User = require("../models/User");

// Campos seguros para retornar (evita vazar hash/salts/tokens)
const SAFE_FIELDS =
  "name email role isActive phone department createdAt updatedAt";

// Helper: parse boolean query (onlyActive)
const parseBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return undefined;
};

// Helper: responde erro padronizado
function bad(res, msg = "Requisição inválida", code = 400) {
  return res.status(code).json({ success: false, error: msg });
}

// Helper: garante profile/compact mesmo sem métodos do schema
function toCompactSafe(userDoc) {
  if (!userDoc) return null;
  if (typeof userDoc.toCompact === "function") return userDoc.toCompact();
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  return {
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: Boolean(u.isActive),
  };
}
function toProfileSafe(userDoc) {
  if (!userDoc) return null;
  if (typeof userDoc.toProfile === "function") return userDoc.toProfile();
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  return {
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: Boolean(u.isActive),
    phone: u.phone || null,
    department: u.department || null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

// Conta admins ativos (excluindo opcionalmente um _id)
async function countActiveAdmins(excludeId = null) {
  const filter = { role: "admin", isActive: true };
  if (excludeId) filter._id = { $ne: excludeId };
  return User.countDocuments(filter).setOptions({ sanitizeFilter: true });
}

/* ============================================================
 * Authenticated user endpoints
 * ============================================================ */

// GET /users/me/compact
exports.getMeCompact = async (req, res) => {
  try {
    return res.json({ success: true, data: toCompactSafe(req.user) });
  } catch (e) {
    return bad(res, e.message);
  }
};

// GET /users/me/profile
exports.getMeProfile = async (req, res) => {
  try {
    return res.json({ success: true, data: toProfileSafe(req.user) });
  } catch (e) {
    return bad(res, e.message);
  }
};

// GET /users/:userId/profile  (admin)
exports.getUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) return bad(res, "ID inválido");
    const user = await User.findById(userId).select(SAFE_FIELDS);
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "Usuário não encontrado" });
    return res.json({ success: true, data: toProfileSafe(user) });
  } catch (e) {
    return bad(res, e.message);
  }
};

/* ============================================================
 * Admin endpoints
 * ============================================================ */

// GET /users  (admin) — listagem com busca/filtros/paginação
exports.listUsers = async (req, res) => {
  try {
    const { q, role, onlyActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
      ];
    }
    if (role) filter.role = role;
    const only = parseBool(onlyActive);
    if (only === true) filter.isActive = true;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      User.find(filter)
        .setOptions({ sanitizeFilter: true })
        .select(SAFE_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
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
    return bad(res, e.message);
  }
};

exports.createUserAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "usuario",
      isActive = true,
    } = req.body || {};

    // validações simples
    if (!name || !email || !password) {
      return res
        .status(422)
        .json({
          success: false,
          error: "Nome, e-mail e senha são obrigatórios",
        });
    }
    const roles = ["admin", "tecnico", "usuario"];
    if (!roles.includes(String(role))) {
      return res.status(422).json({ success: false, error: "Papel inválido" });
    }
    // e-mail único
    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return res
        .status(409)
        .json({ success: false, error: "E-mail já cadastrado" });
    }

    // cria e salva (assumindo que o model faz hash da senha em pre('save'))
    const user = new User({
      name,
      email,
      role,
      isActive: !!isActive,
    });
    user.password = password;

    await user.save();

    // retorna compacto (sem tokens)
    return res.status(201).json({
      success: true,
      data: user.toCompact
        ? user.toCompact()
        : {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
          },
    });
  } catch (e) {
    console.error("[createUserAdmin] error:", e);
    return res
      .status(500)
      .json({ success: false, error: "Erro ao criar usuário" });
  }
};

// GET /users/:id  (admin)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return bad(res, "ID inválido");
    const user = await User.findById(id).select(SAFE_FIELDS);
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "Usuário não encontrado" });
    return res.json({ success: true, data: toProfileSafe(user) });
  } catch (e) {
    return bad(res, e.message);
  }
};

// PUT /users/:id  (admin) — atualiza name, role, isActive
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return bad(res, "ID inválido");

    const target = await User.findById(id);
    if (!target)
      return res
        .status(404)
        .json({ success: false, error: "Usuário não encontrado" });

    const { name, role, isActive } = req.body;

    // validações simples
    const ROLES = new Set(["admin", "tecnico", "usuario"]);
    if (typeof role !== "undefined" && !ROLES.has(role)) {
      return bad(res, "Função inválida");
    }

    // Proteção: não permitir remover/demotar/desativar o ÚLTIMO admin
    const willChangeRole = typeof role !== "undefined" && role !== target.role;
    const willChangeActive =
      typeof isActive !== "undefined" &&
      Boolean(isActive) !== Boolean(target.isActive);

    if (target.role === "admin") {
      const willNoLongerBeAdmin = willChangeRole && role !== "admin";
      const willBeInactive = willChangeActive && isActive === false;

      if (willNoLongerBeAdmin || willBeInactive) {
        const adminsLeft = await countActiveAdmins(target._id);
        if (adminsLeft <= 0) {
          return bad(
            res,
            "Operação negada: não é permitido remover/desativar o último admin."
          );
        }
      }
    }

    // Proteção adicional: se o próprio último admin tentar se demitir/desativar
    // (req.user vem do requireAuth)
    if (String(req.user._id) === String(target._id)) {
      const stillAdmin =
        typeof role === "undefined"
          ? target.role === "admin"
          : role === "admin";
      const stillActive =
        typeof isActive === "undefined" ? target.isActive : Boolean(isActive);
      if (!(stillAdmin && stillActive)) {
        const adminsLeft = await countActiveAdmins(target._id);
        if (adminsLeft <= 0) {
          return bad(res, "Operação negada: você é o último admin ativo.");
        }
      }
    }

    // aplica mudanças permitidas
    if (typeof name !== "undefined") target.name = name;
    if (typeof role !== "undefined") target.role = role;
    if (typeof isActive !== "undefined") target.isActive = Boolean(isActive);

    await target.save();

    const safe = await User.findById(target._id).select(SAFE_FIELDS);
    return res.json({ success: true, data: toProfileSafe(safe) });
  } catch (e) {
    return bad(res, e.message);
  }
};

// PATCH /users/:id/toggle  (admin) — alterna isActive
exports.toggleUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return bad(res, "ID inválido");

    const target = await User.findById(id);
    if (!target)
      return res
        .status(404)
        .json({ success: false, error: "Usuário não encontrado" });

    // não desativar o último admin
    if (target.role === "admin" && target.isActive === true) {
      const adminsLeft = await countActiveAdmins(target._id);
      if (adminsLeft <= 0) {
        return bad(
          res,
          "Operação negada: não é permitido desativar o último admin."
        );
      }
    }

    target.isActive = !target.isActive;
    await target.save();

    const safe = await User.findById(target._id).select(SAFE_FIELDS);
    return res.json({ success: true, data: toProfileSafe(safe) });
  } catch (e) {
    return bad(res, e.message);
  }
};
