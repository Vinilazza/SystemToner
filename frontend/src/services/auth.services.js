// src/services/auth.services.js
import api from "@/lib/axios";

function normalizeAuthPayload(payload) {
  const d = payload?.data ?? payload ?? {};
  const user = d.user ?? d.profile ?? null;
  const accessToken = d.accessToken ?? d.token ?? d.tokens?.accessToken ?? null;
  const refreshToken = d.refreshToken ?? d.tokens?.refreshToken ?? null;
  return { user, accessToken, refreshToken };
}

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  const p = res?.data;

  // se a API usar {success:false}, trate como erro
  if (p?.success === false) {
    const err = new Error(p?.error || "Falha no login");
    err.response = { status: 401, data: p };
    throw err;
  }

  let { user, accessToken, refreshToken } = normalizeAuthPayload(p);

  if (!user) {
    throw new Error("Resposta inválida: usuário ausente");
  }

  // Fallback: se não veio accessToken, tenta pegar via /auth/refresh (cookie httpOnly)
  if (!accessToken) {
    try {
      const rf = await api.post("/auth/refresh");
      const rfp = rf?.data;
      const norm = normalizeAuthPayload(rfp);
      accessToken = norm.accessToken || accessToken;
      refreshToken = norm.refreshToken || refreshToken;
    } catch {
      // segue sem token; trataremos abaixo
    }
  }

  if (!accessToken) {
    // Se seu app depende do header Authorization, precisamos do access token
    throw new Error("Resposta inválida: accessToken ausente");
  }

  return { user, accessToken, refreshToken };
}
export async function logout() {
  await api.post("/auth/logout");
}

export async function refresh() {
  const { data } = await api.post("/auth/refresh");
  return data?.data?.accessToken;
}

// NOVO: registrar usuário (role default = "usuario")
export async function register({ name, email, password }) {
  const { data } = await api.post("/auth/register", { name, email, password });
  return {
    user: data?.data?.user,
    accessToken: data?.data?.tokens?.accessToken, // pode vir null se usar cookie httpOnly
  };
}
