import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as auth from "@/services/auth.services";
import { toast } from "sonner";
import { meCompact } from "@/services/user.service";
const AuthCtx = createContext(null);
import { saveTokens, loadAccessToken, clearTokens } from "@/lib/tokenStorage";
import {
  setAccessToken,
  clearAccessToken,
  hasEncryptedTokens,
} from "@/lib/authToken";
export default function AuthProvider({ children }) {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootstrap, setBootstrap] = useState({
    hasStoredTokens: hasEncryptedTokens(),
  });
  // force logout vindo do axios
  useEffect(() => {
    function handler() {
      logout(true);
    }
    window.addEventListener("auth:force-logout", handler);
    return () => window.removeEventListener("auth:force-logout", handler);
  }, []);

  // bootstrap (tenta pegar /users/me/compact com refresh auto lá no axios)
  useEffect(() => {
    (async () => {
      try {
        // 1) tenta recuperar access do storage (criptografado)
        const stored = await loadAccessToken();
        if (stored) {
          setAccessToken(stored); // memória síncrona para axios
          setAccessTokenState(stored); // estado para a UI
        } else {
          // 2) se não há access, tenta refresh silencioso (cookie httpOnly)
          try {
            const res = await auth.refresh?.(); // crie em auth.services.js se ainda não tiver
            const newAccess = res?.accessToken || res; // compat
            if (newAccess) {
              setAccessToken(newAccess);
              setAccessTokenState(newAccess);
              saveTokens?.({ accessToken: newAccess });
              setBootstrap({ hasStoredTokens: true });
            }
          } catch {}
        }

        // 3) só agora chama o me/compact — já com Authorization no axios
        const me = await meCompact();
        setUser(me || null);
      } catch {
        // não logado
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const { user, accessToken, refreshToken } = await auth.login(
      email,
      password
    );
    setUser(user);
    setAccessToken(accessToken);
    setBootstrap({ hasStoredTokens: true });
    return user;
  }

  async function logout(silent = false) {
    try {
      await auth.logout();
    } catch {}
    setUser(null);
    setAccessToken(null);
    setBootstrap({ hasStoredTokens: false });
    clearTokens();
    qc.clear();
    if (!silent) toast.success("Sessão encerrada");
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      bootstrap,
      isAuthenticated: !!user,
      hasRole: (roles = []) => (user ? roles.includes(user.role) : false),
      login,
      logout,
      setUser,
    }),
    [user, accessToken, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
