import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // necessário p/ cookie httpOnly de refresh
});

let isRefreshing = false;
let queue = [];

function onRefreshed(newAccess) {
  queue.forEach((p) => p.resolve(newAccess));
  queue = [];
}
function onRefreshError(err) {
  queue.forEach((p) => p.reject(err));
  queue = [];
}

api.interceptors.request.use((config) => {
  const token = window.__ACCESS_TOKEN__ || null; // guardado em memória (AuthProvider)
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    // evita loop no próprio refresh/logout
    const isAuthRoute = /\/auth\/(refresh|login|logout)/.test(
      original?.url || ""
    );

    if (status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await api.post("/auth/refresh"); // cookie httpOnly já vai junto
          const newAccess = data?.data?.accessToken;
          window.__ACCESS_TOKEN__ = newAccess || null;
          isRefreshing = false;
          onRefreshed(newAccess);
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        } catch (err) {
          isRefreshing = false;
          onRefreshError(err);
          // força logout visual (quem escuta é o AuthProvider)
          window.dispatchEvent(new CustomEvent("auth:force-logout"));
          return Promise.reject(err);
        }
      }

      // fila para aguardar refresh
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (newAccess) => {
            if (newAccess)
              original.headers.Authorization = `Bearer ${newAccess}`;
            resolve(api(original));
          },
          reject: (err) => reject(err),
        });
      });
    }
    return Promise.reject(error);
  }
);

export default api;
