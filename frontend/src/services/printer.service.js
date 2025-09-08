import api from "@/lib/axios";

export async function listPrinters({
  page = 1,
  limit = 20,
  q = "",
  onlyActive,
} = {}) {
  const { data } = await api.get("/printers", {
    params: { page, limit, q, onlyActive },
  });
  return data?.data; // { items, total, page, pages }
}
export async function getPrinter(id) {
  const { data } = await api.get(`/printers/${id}`);
  return data?.data;
}
export async function createPrinter(payload) {
  const { data } = await api.post(`/printers`, payload);
  return data?.data;
}
export async function updatePrinter(id, payload) {
  const { data } = await api.put(`/printers/${id}`, payload);
  return data?.data;
}
export async function togglePrinter(id) {
  const { data } = await api.patch(`/printers/${id}/toggle`);
  return data?.data;
}
