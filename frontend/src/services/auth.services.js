// src/services/auth.services.js
import api from "@/lib/axios";

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return {
    user: data?.data?.user,
    accessToken: data?.data?.tokens?.accessToken,
  };
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
