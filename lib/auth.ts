// Auth mínima de un solo usuario para el panel.
// Usa Web Crypto (crypto.subtle) para funcionar tanto en el middleware (edge)
// como en route handlers (node). La sesión es un token firmado con HMAC-SHA256.

const enc = new TextEncoder();
const dec = new TextDecoder();

export const SESSION_COOKIE = "fronteco_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 días

function b64urlFromBytes(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bytesFromB64url(str: string): Uint8Array {
  const s = str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (str.length % 4)) % 4);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

/** Comparación en tiempo constante (evita timing attacks). */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Crea un token de sesión firmado con expiración. */
export async function crearSesion(secret: string): Promise<string> {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = b64urlFromBytes(enc.encode(JSON.stringify({ exp })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(payload));
  return `${payload}.${b64urlFromBytes(sig)}`;
}

/** Verifica firma y expiración del token. */
export async function verificarSesion(secret: string, token?: string | null): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = b64urlFromBytes(await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(payload)));
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const data = JSON.parse(dec.decode(bytesFromB64url(payload)));
    return typeof data.exp === "number" && Date.now() < data.exp;
  } catch {
    return false;
  }
}

export const SESSION_MAX_AGE_SEC = MAX_AGE_SEC;

/** SHA-256 en hex (para comparar contra AUTH_PASSWORD_HASH). */
export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}
