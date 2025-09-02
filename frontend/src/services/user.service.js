import api from "@/lib/axios";

// para hidratar app
export async function meCompact() {
  const { data } = await api.get("/users/me/compact");
  return data?.data;
}

// perfil completo
export async function meProfile() {
  const { data } = await api.get("/users/me/profile");
  return data?.data;
}
