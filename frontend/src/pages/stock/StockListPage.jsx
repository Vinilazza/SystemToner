// src/pages/stock/StockListPage.jsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listStock } from "@/services/stock.services";
import { listToners } from "@/services/toner.service";
import { listPrinters } from "@/services/printer.service";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { History, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TYPE_LABEL = { in: "Entrada", out: "Saída", adjust: "Ajuste" };
function TypeBadge({ type }) {
  if (type === "in") return <Badge>Entrada</Badge>;
  if (type === "out") return <Badge variant="destructive">Saída</Badge>;
  return <Badge variant="secondary">Ajuste</Badge>;
}

export default function StockListPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all"); // all | in | out | adjust
  const [toner, setToner] = useState("all"); // "all" → undefined
  const [printer, setPrinter] = useState("all"); // "all" → undefined

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      q: q.trim() || undefined,
      type: type === "all" ? undefined : type,
      tonerId: toner === "all" ? undefined : toner,
      printerId: printer === "all" ? undefined : printer,
    }),
    [page, q, type, toner, printer]
  );

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["stock", queryParams],
    queryFn: () => listStock(queryParams),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;
  const total = data?.total || 0;

  // opções de filtro: toner e impressora (top 100 para seleção rápida)
  const { data: tonersData } = useQuery({
    queryKey: ["stock-toners-options"],
    queryFn: () => listToners({ page: 1, limit: 100, onlyActive: true }),
    staleTime: 60_000,
  });
  const tonerOptions = useMemo(
    () => [
      { id: "all", label: "Todos" },
      ...(tonersData?.items || []).map((t) => ({ id: t._id, label: t.name })),
    ],
    [tonersData]
  );

  const { data: printersData } = useQuery({
    queryKey: ["stock-printers-options"],
    queryFn: () => listPrinters({ page: 1, limit: 100, onlyActive: true }),
    staleTime: 60_000,
  });
  const printerOptions = useMemo(
    () => [
      { id: "all", label: "Todas" },
      ...(printersData?.items || []).map((p) => ({ id: p._id, label: p.name })),
    ],
    [printersData]
  );

  if (error) {
    toast.error("Não foi possível carregar o histórico");
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Histórico de movimentações
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe entradas, saídas e ajustes de estoque.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Movimentações
              </CardTitle>
              <CardDescription>
                Use os filtros para encontrar rapidamente o que precisa.
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {isLoading ? "…" : `${total} registro(s)`}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
            <div className="grid gap-2">
              <Label>Texto (observação)</Label>
              <Input
                placeholder="Buscar por observação…"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  setPage(1);
                  setType(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="in">Entrada</SelectItem>
                  <SelectItem value="out">Saída</SelectItem>
                  <SelectItem value="adjust">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Toner</Label>
              <Select
                value={toner}
                onValueChange={(v) => {
                  setPage(1);
                  setToner(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um toner" />
                </SelectTrigger>
                <SelectContent>
                  {tonerOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Impressora</Label>
              <Select
                value={printer}
                onValueChange={(v) => {
                  setPage(1);
                  setPrinter(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma impressora" />
                </SelectTrigger>
                <SelectContent>
                  {printerOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPage(1);
                  setQ("");
                  setType("all");
                  setToner("all");
                  setPrinter("all");
                }}
                title="Limpar filtros"
              >
                <Filter className="mr-2 h-4 w-4" /> Limpar
              </Button>
            </div>
          </div>

          <Separator />

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Toner</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Impressora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Obs.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                      Carregando…
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      Nenhuma movimentação encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  items.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        {m.toner?._id ? (
                          <Link
                            to={`/toners/${m.toner._id}/edit`}
                            className="underline underline-offset-4"
                          >
                            {m.toner?.name}
                            {m.toner?.model ? ` (${m.toner.model})` : ""}
                          </Link>
                        ) : (
                          m.toner?.name || "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <TypeBadge type={m.type} />
                      </TableCell>
                      <TableCell className="text-right">
                        {m.type === "out" ? `- ${m.quantity}` : m.quantity}
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        {m.relatedPrinter?.name || "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {m.user?.name || "-"}
                      </TableCell>
                      <TableCell
                        className="truncate max-w-[320px]"
                        title={m.note || ""}
                      >
                        {m.note || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex items-center gap-2 justify-between">
            <div className="text-sm text-muted-foreground">
              {isFetching ? "Atualizando…" : "Pronto"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {page} de {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
