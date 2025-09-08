// src/pages/toners/TonersListPage.jsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listToners, toggleToner } from "@/services/toner.service";
import { QK } from "@/lib/keys";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Pencil, Plus, Power, MoveRight } from "lucide-react";

import MovementDialog from "@/components/stock/MovementDialog";

export default function TonersListPage() {
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [lowStock, setLowStock] = useState(false);

  const [openMv, setOpenMv] = useState(false);
  const [selectedToner, setSelectedToner] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: QK.toners({ page, q, onlyActive, lowStock }),
    queryFn: () => listToners({ page, limit: 20, q, onlyActive, lowStock }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;
  const total = data?.total || 0;

  async function onToggleActive(id) {
    try {
      await toggleToner(id);
      toast.success("Status atualizado");
      qc.invalidateQueries({
        queryKey: QK.toners({ page, q, onlyActive, lowStock }),
      });
    } catch (e) {
      toast.error(e?.response?.data?.error || "Não foi possível atualizar");
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Toners</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie modelos de toner e seus níveis de estoque.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/printers/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova impressora
            </Link>
          </Button>
          <Button asChild>
            <Link to="/toners/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo toner
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedToner(null);
              setOpenMv(true);
            }}
            title="Registrar movimento"
          >
            Registrar movimento <MoveRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Listagem</span>
            <span className="text-sm font-normal text-muted-foreground">
              {isLoading ? "…" : `${total} registro(s)`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nome/sku/marca…"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                className="w-72"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPage(1);
                  setQ("");
                }}
              >
                Limpar
              </Button>
            </div>
            <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2">
                <Switch
                  id="onlyActive"
                  checked={onlyActive}
                  onCheckedChange={(v) => {
                    setPage(1);
                    setOnlyActive(v);
                  }}
                />
                <Label htmlFor="onlyActive" className="text-sm">
                  Apenas ativos
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="lowStock"
                  checked={lowStock}
                  onCheckedChange={(v) => {
                    setPage(1);
                    setLowStock(v);
                  }}
                />
                <Label htmlFor="lowStock" className="text-sm">
                  Abaixo do mínimo
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right">Mín.</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                      Nenhum toner encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  items.map((t) => {
                    const falta = Math.max(
                      0,
                      (t.minStock ?? 0) - (t.currentStock ?? 0)
                    );
                    return (
                      <TableRow key={t._id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>{t.sku || "-"}</TableCell>
                        <TableCell>{t.brand || "-"}</TableCell>
                        <TableCell className="capitalize">
                          {t.color || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {t.currentStock ?? 0}{" "}
                          {falta > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              Falta {falta}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {t.minStock ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              title="Editar toner"
                            >
                              <Link to={`/toners/${t._id}/edit`}>
                                <Pencil className="h-4 w-4 mr-1" /> Editar
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onToggleActive(t._id)}
                              title={t.isActive ? "Desativar" : "Ativar"}
                            >
                              <Power className="h-4 w-4 mr-1" />{" "}
                              {t.isActive ? "Desativar" : "Ativar"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedToner({
                                  _id: t._id,
                                  name: t.name,
                                  sku: t.sku,
                                });
                                setOpenMv(true);
                              }}
                              title="Registrar movimento"
                            >
                              <MoveRight className="h-4 w-4 mr-1" /> Movimentar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      {/* Dialog de movimento */}
      <MovementDialog
        open={openMv}
        onOpenChange={setOpenMv}
        defaultToner={selectedToner}
        onSuccess={() => {}}
      />
    </div>
  );
}
