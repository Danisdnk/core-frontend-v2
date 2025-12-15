import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginCredentials {
  email: string;
  password: string;
}

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const REDIRECT_KEY = "post_login_redirect_url";

function log(...args: any[]) {
  console.log("[CORE-LOGIN]", ...args);
}

function readRedirectUrlParam(): string | null {
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

function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (!u.pathname) u.pathname = "/";
    return u;
  } catch {
    return null;
  }
}

function appendToken(dest: string, token: string) {
  const u = new URL(dest);
  u.searchParams.set("JWT", token);
  return u.toString();
}

function captureRedirectUrlOnce(): string | null {
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

export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const urlbase = "https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api";
  const capturedRedirect = useMemo(() => captureRedirectUrlOnce(), []);

  const login = async ({ email, password }: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${urlbase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message =
          data?.message ||
          data?.error ||
          "Error de autenticación, verifique sus credenciales";
        throw new Error(message);
      }

      if (!data.access_token) {
        throw new Error("No se recibió token de autenticación");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("token_type", data.token_type);
      localStorage.setItem("expires_in", data.expires_in.toString());

      log("Tokens guardados (localStorage + sessionStorage).");

      const dest = capturedRedirect || sessionStorage.getItem(REDIRECT_KEY);

      log("Destino post-login (captured/session):", dest);

      if (dest) {
        const parsedDest = safeUrl(dest);

        if (!parsedDest) {
          log("Destino inválido (no parsea). Se ignora y va a /home.");
          sessionStorage.removeItem(REDIRECT_KEY);
          navigate("/home", { replace: true });
          return;
        }

        const target = appendToken(parsedDest.toString(), data.access_token);
        log("Redirigiendo a portal:", target);
        sessionStorage.removeItem(REDIRECT_KEY);
        window.location.href = target;
        return;
      }

      log("Redirigiendo default a /home");
      navigate("/home", { replace: true });
    } catch (err: any) {
      console.error("Error de login:", err);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
