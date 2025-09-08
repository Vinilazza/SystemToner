// src/lib/axios.js
import axios from "axios";
import { getAccessToken, setAccessToken } from "@/lib/authToken";
import { saveTokens } from "@/lib/tokenStorage"; // se você usa o armazenamento criptografado
// Base do backend
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  withCredentials: true, // se usar refresh via cookie httpOnly
});

// Injeta Authorization em TODA request
api.interceptors.request.use((cfg) => {
  const t = getAccessToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Anexa o AccessToken da memória (AuthProvider mantém em window.__ACCESS_TOKEN__)
api.interceptors.request.use((config) => {
  const token = window.__ACCESS_TOKEN__;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh automático em 401
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const cfg = error?.config;
    const status = error?.response?.status;

    if (status === 401 && !cfg?._retry) {
      cfg._retry = true;

      try {
        // tenta refresh diretamente no mesmo client para evitar import circular
        refreshing =
          refreshing ||
          api
            .post("/auth/refresh")
            .then((res) => {
              const newToken = res?.data?.data?.accessToken;
              if (newToken) {
                setAccessToken(newToken); // memória síncrona
                saveTokens?.({ accessToken: newToken }); // persiste criptografado (se usar)
              }
              return newToken;
            })
            .finally(() => (refreshing = null));

        const newToken = await refreshing;
        if (!newToken) throw new Error("refresh-failed");
        cfg.headers.Authorization = `Bearer ${newToken}`;
        return api(cfg);
      } catch {
        // avisa o AuthProvider para fazer logout
        window.dispatchEvent(new CustomEvent("auth:force-logout"));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
