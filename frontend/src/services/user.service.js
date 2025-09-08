// src/services/user.service.js
import api from "@/lib/axios";

// já existia:
export async function meCompact() {
  const { data } = await api.get("/users/me/compact");
  return data?.data;
}
export async function meProfile() {
  const { data } = await api.get("/users/me/profile");
  return data?.data;
}

export async function createUser({
  name,
  email,
  password,
  role = "usuario",
  isActive = true,
}) {
  const { data } = await api.post("/users", {
    name,
    email,
    password,
    role,
    isActive,
  });
  return data?.data; // user compacto
}

// NOVAS (Admin)
export async function listUsers({
  page = 1,
  limit = 20,
  q = "",
  role,
  onlyActive,
} = {}) {
  const params = { page, limit, q };
  if (role) params.role = role;
  if (onlyActive !== undefined) params.onlyActive = onlyActive;
  const { data } = await api.get("/users", { params });
  return data?.data; // { items, total, page, pages }
}

export async function getUserById(id) {
  const { data } = await api.get(`/users/${id}`);
  return data?.data;
}

export async function updateUser(id, payload) {
  // payload pode ter: { name, role, isActive }
  const { data } = await api.put(`/users/${id}`, payload);
  return data?.data;
}

export async function toggleUser(id) {
  const { data } = await api.patch(`/users/${id}/toggle`);
  return data?.data;
}
