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
  return normalized;
}

export function log(...args: any[]) {
  console.log("[CORE-LOGIN]", ...args);
}
export function logoutLocal() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("expires_in");
  sessionStorage.removeItem("external_access_token");
  sessionStorage.removeItem(REDIRECT_KEY);
}

export function withToken(destino: string | null, token: string): string {
  if (typeof destino !== "string" || destino.trim() === "") {
    throw new Error("withToken: destino inválido (null o vacío)");
  }

  const u = new URL(destino);
  u.searchParams.set("access_token", token);
  return u.toString();
}
