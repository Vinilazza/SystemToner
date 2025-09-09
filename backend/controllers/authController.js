const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { signAccess, signRefresh, verifyRefresh } = require("../utils/jwt");

const USE_HTTPONLY_COOKIES =
  String(process.env.USE_HTTPONLY_COOKIES) === "true";

function msFromDaysStr(daysStr) {
  // "30d" -> ms
  const n = parseInt(String(daysStr).replace("d", ""), 10);
  return n * 24 * 60 * 60 * 1000;
}

async function createAndStoreRefresh(userId, userAgent, ip) {
  const token = signRefresh({ sub: userId });
  const hash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(
    Date.now() + msFromDaysStr(process.env.JWT_REFRESH_EXPIRES || "30d")
  );
  await RefreshToken.create({
    user: userId,
    tokenHash: hash,
    expiresAt,
    userAgent: (userAgent || "").slice(0, 300),
    ip: (ip || "").slice(0, 100),
  });
  return token;
}

async function matchStoredRefresh(userId, refreshToken) {
  const list = await RefreshToken.find({
    user: userId,
    revokedAt: { $exists: false },
  });
  for (const t of list) {
    if (await bcrypt.compare(refreshToken, t.tokenHash)) return t;
  }
  return null;
}

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, errors: errors.array() });

  const {
    name,
    email,
    password,
    role = "usuario",
    phone,
    department,
    avatarUrl,
  } = req.body;
  const exists = await User.findOne({ email });
  if (exists)
    return res
      .status(409)
      .json({ success: false, error: "E-mail já cadastrado" });

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    department,
    avatarUrl,
  });

  const accessToken = signAccess({ sub: user._id.toString(), role: user.role });
  const refreshToken = await createAndStoreRefresh(
    user._id.toString(),
    req.headers["user-agent"],
    req.ip
  );

  if (USE_HTTPONLY_COOKIES) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: msFromDaysStr(process.env.JWT_REFRESH_EXPIRES || "30d"),
    });
  }

  return res.status(201).json({
    success: true,
    data: {
      user: user.toCompact(),
      tokens: {
        accessToken,
        ...(USE_HTTPONLY_COOKIES ? {} : { refreshToken }),
      },
    },
  });
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.isActive)
    return res
      .status(401)
      .json({ success: false, error: "Credenciais inválidas" });

  const ok = await user.comparePassword(password);
  if (!ok)
    return res
      .status(401)
      .json({ success: false, error: "Credenciais inválidas" });

  // auditoria
  user.lastLoginAt = new Date();
  user.lastLoginIp = req.ip;
  await user.save();

  const accessToken = signAccess({ sub: user._id.toString(), role: user.role });
  const refreshToken = await createAndStoreRefresh(
    user._id.toString(),
    req.headers["user-agent"],
    req.ip
  );

  if (USE_HTTPONLY_COOKIES) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: msFromDaysStr(process.env.JWT_REFRESH_EXPIRES || "30d"),
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      user: user.toCompact(),
      tokens: {
        accessToken,
        ...(USE_HTTPONLY_COOKIES ? {} : { refreshToken }),
      },
    },
  });
};

exports.refresh = async (req, res) => {
  try {
    const token = USE_HTTPONLY_COOKIES
      ? req.cookies?.refreshToken || ""
      : req.body?.refreshToken || "";
    if (!token)
      return res
        .status(401)
        .json({ success: false, error: "Sem refresh token" });

    const payload = verifyRefresh(token);
    const stored = await matchStoredRefresh(payload.sub, token);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ success: false, error: "Refresh inválido" });
    }

    // rotate
    await RefreshToken.updateOne(
      { _id: stored._id },
      { $set: { revokedAt: new Date() } }
    );
    const newRefresh = await createAndStoreRefresh(
      payload.sub,
      req.headers["user-agent"],
      req.ip
    );
    const accessToken = signAccess({ sub: payload.sub });

    if (USE_HTTPONLY_COOKIES) {
      res.cookie("refreshToken", newRefresh, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: msFromDaysStr(process.env.JWT_REFRESH_EXPIRES || "30d"),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        ...(USE_HTTPONLY_COOKIES ? {} : { refreshToken: newRefresh }),
      },
    });
  } catch (e) {
    return res
      .status(401)
      .json({ success: false, error: "Refresh inválido ou expirado" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = USE_HTTPONLY_COOKIES
      ? req.cookies?.refreshToken || ""
      : req.body?.refreshToken || "";
    if (token) {
      try {
        const payload = verifyRefresh(token);
        const stored = await matchStoredRefresh(payload.sub, token);
        if (stored)
          await RefreshToken.updateOne(
            { _id: stored._id },
            { $set: { revokedAt: new Date() } }
          );
      } catch (_) {}
    }
    if (USE_HTTPONLY_COOKIES) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/auth/refresh",
      });
    }
    return res.json({ success: true, message: "Logout efetuado" });
  } catch {
    return res.status(500).json({ success: false, error: "Erro no logout" });
  }
};
