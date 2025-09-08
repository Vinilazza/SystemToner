// src/pages/users/UsersListPage.jsx
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { listUsers, toggleUser, createUser } from "@/services/user.service";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Pencil, Power, Plus, Eye, EyeOff } from "lucide-react";

const ROLES = [
  { value: "all", label: "Todos" },
  { value: "admin", label: "Admin" },
  { value: "tecnico", label: "Técnico" },
  { value: "usuario", label: "Usuário (leitor)" },
];

function CreateUserDialog({ open, onOpenChange, onCreated }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("usuario");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Informe o nome");
      if (!/^\S+@\S+\.\S+$/.test(email.trim()))
        throw new Error("E-mail inválido");
      if (!password) throw new Error("Informe a senha");
      return createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        isActive,
      });
    },
    onSuccess: (user) => {
      toast.success("Usuário criado com sucesso");
      qc.invalidateQueries({ queryKey: ["users"] });
      onCreated?.(user);
      onOpenChange(false);
      // reset
      setName("");
      setEmail("");
      setPassword("");
      setRole("usuario");
      setIsActive(true);
    },
    onError: (e) => {
      const msg =
        e?.response?.data?.error || e?.message || "Falha ao criar usuário";
      toast.error(msg);
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar o usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="pessoa@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Papel</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuário</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="mb-1">Status</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isPending}
                />
                <Label htmlFor="active" className="text-sm">
                  {isActive ? "Ativo" : "Inativo"}
                </Label>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={() => mutateAsync()} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Criando…
              </>
            ) : (
              "Criar usuário"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersListPage() {
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [onlyActive, setOnlyActive] = useState(undefined); // undefined = todos
  const [openCreate, setOpenCreate] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["users", { page, q, role, onlyActive }],
    queryFn: () =>
      listUsers({
        page,
        limit: 20,
        q,
        role: role === "all" ? undefined : role,
        onlyActive,
      }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;
  const total = data?.total || 0;

  async function onToggle(id) {
    try {
      await toggleUser(id);
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (e) {
      toast.error(e?.response?.data?.error || "Falha ao atualizar");
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie papéis e acesso dos usuários.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo usuário
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
                placeholder="Buscar por nome/e-mail…"
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

            <div className="flex items-center gap-4">
              <div className="grid gap-2">
                <Label>Função</Label>
                <Select
                  value={role}
                  onValueChange={(v) => {
                    setPage(1);
                    setRole(v);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Função" />
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
                  id="onlyActive"
                  checked={onlyActive === true}
                  onCheckedChange={(v) => {
                    setPage(1);
                    setOnlyActive(v ? true : undefined);
                  }}
                />
                <Label htmlFor="onlyActive" className="text-sm">
                  Apenas ativos
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
                  <TableHead>E-mail</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                      Carregando…
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  items.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">
                        {u.name || "-"}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell>{u.isActive ? "Ativo" : "Inativo"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            title="Editar"
                          >
                            <Link to={`/users/${u._id}/edit`}>
                              <Pencil className="h-4 w-4 mr-1" /> Editar
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onToggle(u._id)}
                            title={u.isActive ? "Desativar" : "Ativar"}
                          >
                            <Power className="h-4 w-4 mr-1" />{" "}
                            {u.isActive ? "Desativar" : "Ativar"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex items-center gap-2 justify-end">
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
        </CardContent>
      </Card>

      {/* Dialog de criação */}
      <CreateUserDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreated={() => {
          setPage(1);
        }}
      />
    </div>
  );
}
