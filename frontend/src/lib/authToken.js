// src/lib/authToken.js
let _accessToken = null;
const STORAGE_KEY = "st:tokens.v1";
export function setAccessToken(token) {
  _accessToken = token || null;
  // expõe p/ interceptors antigos, se existirem
  window.__ACCESS_TOKEN__ = _accessToken;
}

export function getAccessToken() {
  return _accessToken;
}

export function hasEncryptedTokens() {
  return !!localStorage.getItem(STORAGE_KEY);
}

export function clearAccessToken() {
  _accessToken = null;
  window.__ACCESS_TOKEN__ = null;
}
