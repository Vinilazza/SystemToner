import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { QK } from "@/lib/keys";
import { createToner, getToner, updateToner } from "@/services/toner.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const COLORS = [
  { value: "black", label: "Preto" },
  { value: "cyan", label: "Ciano" },
  { value: "magenta", label: "Magenta" },
  { value: "yellow", label: "Amarelo" },
  { value: "other", label: "Outro" },
];

export default function TonerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    brand: "",
    model: "",
    sku: "",
    color: "black",
    minStock: 0,
    currentStock: 0,
    isActive: true,
  });

  // Carrega dados ao editar
  const { data, isLoading } = useQuery({
    queryKey: QK.toner(id),
    queryFn: () => getToner(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data && isEdit) {
      setForm({
        name: data.name || "",
        brand: data.brand || "",
        model: data.model || "",
        sku: data.sku || "",
        color: data.color || "black",
        minStock: data.minStock ?? 0,
        currentStock: data.currentStock ?? 0,
        isActive: data.isActive ?? true,
      });
    }
  }, [data, isEdit]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? updateToner(id, payload) : createToner(payload),
    onSuccess: () => {
      toast.success(isEdit ? "Toner atualizado!" : "Toner criado!");
      qc.invalidateQueries(); // simples: invalida tudo relacionado
      nav("/toners", { replace: true });
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "Não foi possível salvar"),
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({
      ...s,
      [name]:
        name === "minStock" || name === "currentStock" ? Number(value) : value,
    }));
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
          {isEdit ? "Editar toner" : "Novo toner"}
        </h1>
        <Button asChild variant="outline">
          <Link to="/toners">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do toner</CardTitle>
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
                  placeholder="Ex.: HP 12A"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={form.sku}
                  onChange={onChange}
                  placeholder="Ex.: HP-Q2612A"
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
                  placeholder="Ex.: Q2612A"
                />
              </div>

              <div className="grid gap-2">
                <Label>Cor</Label>
                <Select
                  value={form.color}
                  onValueChange={(v) => setForm((s) => ({ ...s, color: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="minStock">Estoque mínimo</Label>
                <Input
                  id="minStock"
                  name="minStock"
                  type="number"
                  min={0}
                  value={form.minStock}
                  onChange={onChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currentStock">Estoque atual</Label>
                <Input
                  id="currentStock"
                  name="currentStock"
                  type="number"
                  min={0}
                  value={form.currentStock}
                  onChange={onChange}
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
                <Label htmlFor="isActive">Ativo</Label>
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
