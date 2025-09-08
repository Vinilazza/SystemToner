// src/lib/tokenStorage.js
// Armazena tokens "ofuscados" com AES-GCM 256 no localStorage.
// Atenção: criptografia no front é apenas ofuscação; não trate como segredo absoluto.

const STORAGE_KEY = "st:tokens.v1";
let _cryptoKey = null;

const enc = new TextEncoder();
const dec = new TextDecoder();

// base64 helpers
function b64encode(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64decode(str) {
  const bin = atob(str);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

// Gera/importa UMA chave AES-GCM **256-bit**
async function getKey() {
  if (_cryptoKey) return _cryptoKey;

  // frase estável (pode customizar)
  const passphrase = `${location.origin}|SystemToner|tokens|v1`;
  // Deriva 32 bytes com SHA-256 da passphrase
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(passphrase));
  // Importa como chave AES-GCM (256 bits) — OK no Chrome/Firefox/Safari
  _cryptoKey = await crypto.subtle.importKey(
    "raw",
    hash, // 32 bytes => 256-bit
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return _cryptoKey;
}

async function encryptString(plain) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recomendado
  const data = enc.encode(plain);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  // guarda como "b64(iv).b64(ciphertext)"
  return `${b64encode(iv)}.${b64encode(ct)}`;
}

async function decryptString(payload) {
  if (!payload || typeof payload !== "string" || !payload.includes("."))
    return null;
  const [ivb64, ctb64] = payload.split(".");
  const key = await getKey();
  const iv = new Uint8Array(b64decode(ivb64));
  const ct = b64decode(ctb64);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return dec.decode(pt);
}

// API pública
export async function saveTokens({ accessToken, refreshToken } = {}) {
  const obj = {
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
  };
  const json = JSON.stringify(obj);
  const sealed = await encryptString(json);
  localStorage.setItem(STORAGE_KEY, sealed);
}

export async function loadTokens() {
  try {
    const sealed = localStorage.getItem(STORAGE_KEY);
    if (!sealed) return null;
    const json = await decryptString(sealed);
    if (!json) return null;
    return JSON.parse(json);
  } catch (_) {
    // incompatibilidade de versão/corrupção => limpa
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export async function loadAccessToken() {
  const t = await loadTokens();
  return t?.accessToken || null;
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
}
