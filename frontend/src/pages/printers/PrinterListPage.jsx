// src/pages/printers/PrintersListPage.jsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { listPrinters, togglePrinter } from "@/services/printer.service";

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
import { Loader2, Pencil, Plus, Power, Printer } from "lucide-react";

export default function PrintersListPage() {
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["printers", { page, q, onlyActive }],
    queryFn: () => listPrinters({ page, limit: 20, q, onlyActive }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;
  const total = data?.total || 0;

  async function onToggleActive(id) {
    try {
      await togglePrinter(id);
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["printers"] });
    } catch (e) {
      toast.error(e?.response?.data?.error || "Não foi possível atualizar");
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Impressoras</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as impressoras cadastradas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/printers/new">
              <Plus className="mr-2 h-4 w-4" /> Nova impressora
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Listagem
            </span>
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
                placeholder="Buscar por nome/marca/modelo/local/IP…"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                className="w-80"
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
                Apenas ativas
              </Label>
            </div>
          </div>

          <Separator />

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                      Carregando…
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      Nenhuma impressora encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  items.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.brand || "-"}</TableCell>
                      <TableCell>{p.model || "-"}</TableCell>
                      <TableCell
                        className="max-w-[220px] truncate"
                        title={p.location || ""}
                      >
                        {p.location || "-"}
                      </TableCell>
                      <TableCell>{p.ip || "-"}</TableCell>
                      <TableCell>{p.serialNumber || "-"}</TableCell>
                      <TableCell>
                        {p.isActive ? (
                          <Badge variant="secondary">Ativa</Badge>
                        ) : (
                          <Badge variant="outline">Inativa</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            title="Editar"
                          >
                            <Link to={`/printers/${p._id}/edit`}>
                              <Pencil className="h-4 w-4 mr-1" /> Editar
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onToggleActive(p._id)}
                            title={p.isActive ? "Desativar" : "Ativar"}
                          >
                            <Power className="h-4 w-4 mr-1" />{" "}
                            {p.isActive ? "Desativar" : "Ativar"}
                          </Button>
                        </div>
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
