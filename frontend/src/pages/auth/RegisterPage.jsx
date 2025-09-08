// src/pages/auth/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { register as registerApi, login } from "@/services/auth.services";
import { useAuth } from "@/providers/AuthProvider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function RegisterPage() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error("Preencha nome, e-mail e senha.");
    if (form.password.length < 6)
      return toast.error("A senha deve ter pelo menos 6 caracteres.");
    if (form.password !== form.confirm)
      return toast.error("As senhas não conferem.");

    setLoading(true);
    try {
      const res = await registerApi({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (res?.user && res?.accessToken) {
        window.__ACCESS_TOKEN__ = res.accessToken;
        setUser(res.user);
      } else {
        await login(form.email, form.password);
      }
      toast.success("Conta criada com sucesso!");
      nav("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.error || "Não foi possível criar a conta.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            Cadastre-se para acessar o controle de toners.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                placeholder="Seu nome"
                value={form.name}
                onChange={onChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="voce@exemplo.com"
                value={form.email}
                onChange={onChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                placeholder="Repita a senha"
                value={form.confirm}
                onChange={onChange}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Criando..." : "Criar conta"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="text-primary underline underline-offset-4 hover:opacity-90 "
              >
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
