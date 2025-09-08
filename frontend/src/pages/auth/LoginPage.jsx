import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch (e) {
      alert("Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 border rounded-md p-6 bg-background"
      >
        <h1 className="text-xl font-semibold">Entrar</h1>
        <div className="space-y-2">
          <label className="text-sm">E-mail</label>
          <input
            className="w-full h-10 border rounded px-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Senha</label>
          <input
            className="w-full h-10 border rounded px-3"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className="w-full h-10 rounded bg-black text-white disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
