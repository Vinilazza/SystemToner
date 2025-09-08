import api from "@/lib/axios";

// GET /stock
export async function listStock({
  page = 1,
  limit = 20,
  q = "",
  type,
  tonerId,
  printerId,
} = {}) {
  const { data } = await api.get("/stock", {
    params: { page, limit, q, type, tonerId, printerId },
  });
  return data?.data; // { items, total, page, pages }
}

// POST /stock (movimentar) — admin/tecnico
export async function createMovement({
  tonerId,
  type,
  quantity,
  note,
  relatedPrinter,
}) {
  const { data } = await api.post("/stock", {
    tonerId,
    type,
    quantity,
    note,
    relatedPrinter,
  });
  return data?.data;
}
