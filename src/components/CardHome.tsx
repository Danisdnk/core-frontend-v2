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

const urlbase = "https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api";

const REDIRECT_KEY = "post_login_redirect_url";

const ALLOWED_ORIGINS = new Set<string>([
  "https://campus-connect-front-docentes.vercel.app",
  "https://student-portal-front-production.up.railway.app",
  "https://uade-store.vercel.app",
  "https://proyecto-react-shadcn.vercel.app",
  "https://biblioteca-uade.vercel.app",
  "https://desap2-eventos-front.onrender.com",
  "https://campus-connect-da-ii.up.railway.app",
  "https://backoffice-production-ui.up.railway.app",
]);

function log(...args: any[]) {
  console.log("[CORE-LOGIN]", ...args);
}

function readRedirectUrlParam(): string | null {
  const qs = new URLSearchParams(window.location.search);
  const raw = qs.get("redirectUrl");
  if (!raw) return null;

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function safeUrl(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function isLocalhostRoot(u: URL) {
  return u.origin === "http://localhost:5173" && (u.pathname === "/" || u.pathname === "");
}

function isAllowed(u: URL) {
  return ALLOWED_ORIGINS.has(u.origin);
}

function appendToken(dest: string, token: string) {
  const u = new URL(dest);
  u.searchParams.set("access_token", token);
  return u.toString();
}

/**
 * Captura redirectUrl del queryparam y lo guarda en sessionStorage.
 * Llamalo desde el hook (se ejecuta 1 vez) y te cubre todo el flujo.
 */
function captureRedirectUrlOnce(): string | null {
  const incoming = readRedirectUrlParam();
  log("redirectUrl param (decoded):", incoming);

  if (!incoming) return null;

  const parsed = safeUrl(incoming);
  if (!parsed) {
    log("redirectUrl inválido (no parsea como URL). Se ignora.");
    return null;
  }

  if (!isAllowed(parsed)) {
    log("redirectUrl NO permitido (origin no whitelisted):", parsed.origin);
    return null;
  }

  sessionStorage.setItem(REDIRECT_KEY, parsed.toString());
  log("redirectUrl guardado en sessionStorage:", parsed.toString());
  return parsed.toString();
}

export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Se ejecuta una sola vez: captura ?redirectUrl=... y lo persiste
  const capturedRedirect = useMemo(() => captureRedirectUrlOnce(), []);

  const login = async ({ email, password }: LoginCredentials) => {
    setLoading(true);
    setError(null);

    log("Iniciando login. email:", email);

    try {
      const response = await fetch(`${urlbase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      log("Respuesta /auth/login:", data);

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
      sessionStorage.setItem("external_access_token", data.access_token);

      log("Tokens guardados (localStorage + sessionStorage).");

      const dest =
        capturedRedirect ||
        sessionStorage.getItem(REDIRECT_KEY);

      log("Destino post-login (captured/session):", dest);

      if (dest) {
        const parsedDest = safeUrl(dest);

        if (!parsedDest) {
          log("Destino inválido (no parsea). Se ignora y va a /home.");
          sessionStorage.removeItem(REDIRECT_KEY);
          navigate("/home", { replace: true });
          return;
        }

        // regla: si la url anterior es localhost root => /home
        if (isLocalhostRoot(parsedDest)) {
          log("Destino es localhost root => /home");
          sessionStorage.removeItem(REDIRECT_KEY);
          navigate("/home", { replace: true });
          return;
        }

        // seguridad: solo whitelisted
        if (isAllowed(parsedDest)) {
          const target = appendToken(parsedDest.toString(), data.access_token);
          log("Redirigiendo a portal:", target);
          sessionStorage.removeItem(REDIRECT_KEY);
          window.location.href = target;
          return;
        }

        log("Destino NO permitido (origin no whitelisted). Se ignora.");
        sessionStorage.removeItem(REDIRECT_KEY);
      }

      log("Redirigiendo default a /home");
      navigate("/home", { replace: true });
    } catch (err: any) {
      console.error("[CORE-LOGIN] Error:", err);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
      log("Fin login.");
    }
  };

  return { login, loading, error };
}
