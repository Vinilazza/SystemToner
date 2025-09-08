// src/lib/axios.js
import axios from "axios";
import { getAccessToken, setAccessToken } from "@/lib/authToken";
// importe saveTokens se você realmente persistir no storage criptografado
// import { saveTokens } from "@/lib/tokenStorage";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  withCredentials: true, // para cookies httpOnly do refresh
});

// ---------- REQUEST: injeta Authorization ----------
api.interceptors.request.use((cfg) => {
  const t = getAccessToken?.() || window.__ACCESS_TOKEN__;
  if (t) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
});

// ---------- RESPONSE (sucesso): converte {success:false} em erro ----------
api.interceptors.response.use(
  (res) => {
    if (
      res?.data &&
      typeof res.data === "object" &&
      res.data.success === false
    ) {
      const err = new Error(res.data.error || "Operação falhou");
      err.response = {
        status: res.status || 400,
        data: res.data,
        config: res.config,
      };
      throw err;
    }
    return res;
  },
  async (error) => {
    // se for erro de rede/time-out, não há o que fazer aqui
    if (!error?.response) return Promise.reject(error);

    const cfg = error.config || {};
    const status = error.response.status;
    const url = String(cfg.url || "");

    // Não fazer refresh nessas rotas:
    const AVOID_REFRESH = [
      /\/auth\/login(\?|$)/,
      /\/auth\/register(\?|$)/,
      /\/auth\/refresh(\?|$)/,
      /\/auth\/logout(\?|$)/,
    ];

    // ---------- 401: refresh automático (com coalescing) ----------
    if (
      status === 401 &&
      !cfg._retry &&
      !AVOID_REFRESH.some((rx) => rx.test(url))
    ) {
      cfg._retry = true;

      // coalescing: reusa uma única promessa de refresh
      try {
        api.__refreshing =
          api.__refreshing ||
          api
            .post("/auth/refresh")
            .then((r) => {
              const newToken = r?.data?.data?.accessToken;
              if (newToken) {
                setAccessToken(newToken); // memória síncrona
                // saveTokens?.({ accessToken: newToken }); // persista se quiser
              }
              return newToken;
            })
            .finally(() => {
              api.__refreshing = null;
            });

        const newToken = await api.__refreshing;
        if (!newToken) throw new Error("refresh-failed");

        // repete a request original com o novo token
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = `Bearer ${newToken}`;
        return api(cfg);
      } catch (e) {
        // refresh falhou: força logout global e rejeita
        window.dispatchEvent(new CustomEvent("auth:force-logout"));
        return Promise.reject(error);
      }
    }

    // outros erros seguem o fluxo normal
    return Promise.reject(error);
  }
);

export default api;
