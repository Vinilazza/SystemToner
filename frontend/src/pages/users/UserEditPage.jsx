import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getUserById, updateUser } from "@/services/user.service";

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

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "tecnico", label: "Técnico" },
  { value: "usuario", label: "Usuário (leitor)" },
];

export default function UserEditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "usuario",
    isActive: true,
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "usuario",
        isActive: data.isActive ?? true,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload) => updateUser(id, payload),
    onSuccess: () => {
      toast.success("Usuário atualizado!");
      qc.invalidateQueries({ queryKey: ["users"] });
      nav("/users", { replace: true });
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "Não foi possível salvar"),
  });

  function onSubmit(e) {
    e.preventDefault();
    if (!form.name) return toast.error("Informe o nome");
    if (!form.role) return toast.error("Selecione a função");
    mutation.mutate({
      name: form.name,
      role: form.role,
      isActive: form.isActive,
    });
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar usuário</h1>
        <Button asChild variant="outline">
          <Link to="/users">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Carregando…</div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={form.email} disabled />
              </div>

              <div className="grid gap-2">
                <Label>Função</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((s) => ({ ...s, role: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  onClick={() => nav("/users")}
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
