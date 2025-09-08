import { useQuery } from "@tanstack/react-query";
import { QK } from "@/lib/keys"; // se não tiver, troque por ["dashboard"]
import { fetchDashboard } from "@/services/dashboard.services";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  Package,
  AlertTriangle,
  History,
  Filter,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const nav = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: QK?.dashboard ?? ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30_000,
  });

  const counters = data?.counters || {
    tonersAtivos: 0,
    baixoEstoque: 0,
    mov24h: 0,
  };
  const lowStock = data?.lowStockList || [];
  const recent = data?.recentMovements || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral do estoque de toners e últimas movimentações.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => nav("/toners")}>
            Ver Toners <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => nav("/stock")}>
            Histórico <History className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toners ativos</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? "…" : counters.tonersAtivos}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Total de modelos cadastrados e ativos.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Abaixo do mínimo</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {isLoading ? "…" : counters.baixoEstoque}
              <Badge variant="destructive" className="ml-1">
                Atenção
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Toners que precisam de reposição.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Movimentações (24h)</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? "…" : counters.mov24h}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Entradas/saídas registradas nas últimas 24 horas.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Abaixo do mínimo */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Toners abaixo do mínimo</CardTitle>
                <CardDescription>
                  Priorize a reposição para evitar interrupções.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/toners">
                  <Filter className="mr-2 h-4 w-4" /> Ver todos
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Mín.</TableHead>
                    <TableHead className="text-right">Reposição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center">
                        Carregando…
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && lowStock.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center">
                        Tudo ok por aqui 🎉
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading &&
                    lowStock.map((t) => {
                      const falta = Math.max(
                        0,
                        (t.minStock ?? 0) - (t.currentStock ?? 0)
                      );
                      return (
                        <TableRow key={t._id}>
                          <TableCell className="font-medium">
                            {t.name}
                          </TableCell>
                          <TableCell>{t.sku || "-"}</TableCell>
                          <TableCell>{t.brand || "-"}</TableCell>
                          <TableCell className="text-right">
                            {t.currentStock ?? 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {t.minStock ?? 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {falta > 0 ? (
                              <Badge variant="secondary">{falta}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Últimas movimentações */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Últimas movimentações</CardTitle>
                <CardDescription>
                  Entradas, saídas e ajustes mais recentes.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/stock">
                  <History className="mr-2 h-4 w-4" /> Ver histórico
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="text-sm text-muted-foreground">Carregando…</div>
            )}
            {!isLoading && recent.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Nenhuma movimentação registrada.
              </div>
            )}
            {!isLoading &&
              recent.slice(0, 8).map((m) => (
                <div key={m._id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {m.type === "in" && <Package className="h-4 w-4" />}
                    {m.type === "out" && <AlertTriangle className="h-4 w-4" />}
                    {m.type === "adjust" && <Plus className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium">{m.toner?.name}</span>{" "}
                      {m.toner?.model ? (
                        <span className="text-muted-foreground">
                          ({m.toner.model})
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(m.createdAt).toLocaleString()} •{" "}
                      <span className="uppercase">{m.type}</span> • Qtd{" "}
                      {m.quantity}
                      {m.relatedPrinter?.name ? (
                        <>
                          {" "}
                          • <span>{m.relatedPrinter.name}</span>
                        </>
                      ) : null}
                      {m.user?.name ? <> • por {m.user.name}</> : null}
                    </div>
                    {m.note && <div className="text-xs mt-1">{m.note}</div>}
                  </div>
                </div>
              ))}
            {!isLoading && recent.length > 8 && (
              <>
                <Separator />
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link to="/stock">Ver mais movimentações</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
