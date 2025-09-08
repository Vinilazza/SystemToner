// src/services/dashboard.service.js
import { listToners } from "@/services/toner.service";
import { listStock } from "@/services/stock.services";

// Busca contadores e listas necessárias em paralelo.
export async function fetchDashboard() {
  // 1) Totais de toners e de baixo estoque (usando total do endpoint)
  const [allToners, lowStock] = await Promise.all([
    listToners({ page: 1, limit: 1, onlyActive: true }), // só pra pegar total
    listToners({ page: 1, limit: 1, onlyActive: true, lowStock: true }),
  ]);

  // 2) Lista de baixo estoque (top N)
  const LOW_LIMIT = 20;
  const lowList = await listToners({
    page: 1,
    limit: LOW_LIMIT,
    onlyActive: true,
    lowStock: true,
  });

  // 3) Últimas movimentações (timeline)
  const MOV_LIMIT = 20;
  const stock = await listStock({ page: 1, limit: MOV_LIMIT });

  // 4) Movimentações nas últimas 24h (kpi simples)
  const now = Date.now();
  const last24 = (stock.items || []).filter(
    (m) => now - new Date(m.createdAt).getTime() <= 24 * 60 * 60 * 1000
  );

  return {
    counters: {
      tonersAtivos: allToners?.total ?? 0,
      baixoEstoque: lowStock?.total ?? 0,
      mov24h: last24.length,
    },
    lowStockList: lowList?.items || [],
    recentMovements: stock?.items || [],
    pages: { stock: stock?.pages || 1 },
  };
}
