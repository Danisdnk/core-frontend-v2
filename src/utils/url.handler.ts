export const REDIRECT_KEY = "post_login_redirect_url";

export function readRedirectUrlParam(): string | null {
  const qs = new URLSearchParams(window.location.search);
  const raw = qs.get("redirectUrl");
  if (!raw) return null;
  try {
    const once = decodeURIComponent(raw);
    return once;
  } catch {
    return raw;
  }
}

export function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (!u.pathname) u.pathname = "/";
    return u;
  } catch {
    return null;
  }
}

export function appendToken(dest: string, token: string) {
  const u = new URL(dest);
  u.searchParams.set("JWT", token);
  return u.toString();
}

export function captureRedirectUrlOnce(): string | null {
  const incoming = readRedirectUrlParam();
  log("redirectUrl param (decoded):", incoming);
  if (!incoming) return null;

  const parsed = safeUrl(incoming);
  if (!parsed) {
    log("redirectUrl inválido (no parsea como URL). Se ignora.");
    return null;
  }

  const normalized = parsed.toString();
  sessionStorage.setItem(REDIRECT_KEY, normalized);
  log("redirectUrl guardado en sessionStorage:", normalized);
  return normalized;
}

export function log(...args: any[]) {
  console.log("[CORE-LOGIN]", ...args);
}
