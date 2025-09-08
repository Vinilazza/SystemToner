import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// ícones
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

const REMEMBER_KEY = "st:remember-email";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const emailRef = useRef(null);
  const [email, setEmail] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // pré-carrega e-mail lembrado
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRememberEmail(true);
      // foca direto na senha
      setTimeout(() => document.getElementById("password")?.focus(), 0);
    } else {
      setTimeout(() => emailRef.current?.focus(), 0);
    }
  }, []);

  function validate() {
    if (!email.trim()) {
      toast.error("Informe seu e-mail.");
      return false;
    }
    // validação simples de e-mail
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("E-mail inválido.");
      return false;
    }
    if (!password) {
      toast.error("Informe sua senha.");
      return false;
    }
    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate() || loading) return;
    setLoading(true);
    try {
      console.log("[login] iniciando…");
      const { user, accessToken } = await login(email.trim(), password); // login deve lançar se falhar
      console.log("[login] sucesso:", {
        user: user?.email,
        hasToken: !!accessToken,
      });

      if (rememberEmail) localStorage.setItem(REMEMBER_KEY, email.trim());
      else localStorage.removeItem(REMEMBER_KEY);

      nav("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Falha no login. Verifique suas credenciais.";
      console.error("[login] erro:", err);
      // se você tem um estado para erro inline, descomente:
      // setErrorMsg?.(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-1">
      {/* Lado esquerdo (branding) — aparece só em telas grandes */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-primary/10">
        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(black,transparent_65%)]" />
        <div className="flex items-center justify-center p-6">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Entrar</CardTitle>
              <CardDescription>
                Acesse sua conta para continuar.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="voce@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      to="/forgot"
                      className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="remember"
                      checked={rememberEmail}
                      onCheckedChange={setRememberEmail}
                      disabled={loading}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Lembrar e-mail
                    </Label>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Entrando…
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Entrar
                    </>
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <p className="text-sm text-muted-foreground">
                Ainda não tem conta?{" "}
                <Link to="/register" className="underline underline-offset-4">
                  Criar cadastro
                </Link>
              </p>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-2">
              <p className="text-xs text-muted-foreground">
                Ao continuar, você concorda com os termos de uso e a política de
                privacidade.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Lado direito (form) */}
    </div>
  );
}
