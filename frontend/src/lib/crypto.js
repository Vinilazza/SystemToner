// src/lib/crypto.js
// Usa AES-GCM com IV aleatório; chave vem de VITE_TOKEN_KEY (base64url)
const b64uToBytes = (b64u) =>
  Uint8Array.from(atob(b64u.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
    c.charCodeAt(0)
  );
const bytesToB64u = (bytes) => {
  const s = String.fromCharCode(...bytes);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

async function getKey() {
  const b64 =
    import.meta.env.VITE_TOKEN_KEY || "Sgq0qf7Q1m3A1J0w9t2W3h8r6u5y2p3x"; // dev fallback
  const raw = b64uToBytes(b64);
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptString(plain) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plain);
  const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc);
  return {
    iv: bytesToB64u(iv),
    data: bytesToB64u(new Uint8Array(buf)),
  };
}

export async function decryptString({ iv, data }) {
  const key = await getKey();
  const ivBytes = b64uToBytes(iv);
  const dataBytes = b64uToBytes(data);
  const buf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    dataBytes
  );
  return new TextDecoder().decode(buf);
}
