// src/services/toner.service.js
import api from "@/lib/axios";

export async function listToners({
  page = 1,
  limit = 20,
  q = "",
  onlyActive,
  lowStock,
} = {}) {
  const { data } = await api.get("/toners", {
    params: { page, limit, q, onlyActive, lowStock },
  });
  return data?.data; // { items, total, page, pages }
}

export async function getToner(id) {
  const { data } = await api.get(`/toners/${id}`);
  return data?.data;
}

export async function createToner(payload) {
  const { data } = await api.post(`/toners`, payload);
  return data?.data;
}

export async function updateToner(id, payload) {
  const { data } = await api.put(`/toners/${id}`, payload);
  return data?.data;
}

export async function toggleToner(id) {
  const { data } = await api.patch(`/toners/${id}/toggle`);
  return data?.data;
}

export async function tonerHistory(id, { page = 1, limit = 20 } = {}) {
  const { data } = await api.get(`/toners/${id}/history`, {
    params: { page, limit },
  });
  return data?.data;
}
