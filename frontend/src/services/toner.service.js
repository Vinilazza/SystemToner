import api from "@/lib/axios";

export async function listToners({ page = 1, limit = 20, q = "" } = {}) {
  const { data } = await api.get("/toners", { params: { page, limit, q } });
  return data?.data; // { items, page, total, hasMore }
}

export async function getToner(id) {
  const { data } = await api.get(`/toners/${id}`);
  return data?.data;
}
