import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  getPrinter,
  createPrinter,
  updatePrinter,
} from "@/services/printer.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PrinterFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    brand: "",
    model: "",
    location: "",
    serialNumber: "",
    ip: "",
    isActive: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["printer", id],
    queryFn: () => getPrinter(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data && isEdit) {
      setForm({
        name: data.name || "",
        brand: data.brand || "",
        model: data.model || "",
        location: data.location || "",
        serialNumber: data.serialNumber || "",
        ip: data.ip || "",
        isActive: data.isActive ?? true,
      });
    }
  }, [data, isEdit]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? updatePrinter(id, payload) : createPrinter(payload),
    onSuccess: () => {
      toast.success(isEdit ? "Impressora atualizada!" : "Impressora criada!");
      qc.invalidateQueries(); // simples
      nav("/toners", { replace: true });
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "Não foi possível salvar"),
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!form.name) return toast.error("Informe o nome");
    mutation.mutate(form);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Editar impressora" : "Nova impressora"}
        </h1>
        <Button asChild variant="outline">
          <Link to="/toners">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da impressora</CardTitle>
        </CardHeader>
        <CardContent>
          {isEdit && isLoading ? (
            <div className="text-sm text-muted-foreground">Carregando…</div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Ex.: HP LaserJet 1320"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={form.brand}
                  onChange={onChange}
                  placeholder="Ex.: HP"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  name="model"
                  value={form.model}
                  onChange={onChange}
                  placeholder="Ex.: 1320"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  placeholder="Ex.: Secretaria de Saúde"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="serialNumber">Nº de série</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  value={form.serialNumber}
                  onChange={onChange}
                  placeholder="Opcional"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ip">IP</Label>
                <Input
                  id="ip"
                  name="ip"
                  value={form.ip}
                  onChange={onChange}
                  placeholder="Ex.: 192.168.1.50"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((s) => ({ ...s, isActive: v }))
                  }
                />
                <Label htmlFor="isActive">Ativa</Label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => nav("/toners")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Salvando…" : "Salvar"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
