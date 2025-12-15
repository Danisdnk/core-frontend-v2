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

const PORTAL_URLS = new Set<string>([
  "https://campus-connect-front-docentes.vercel.app",
  "https://student-portal-front-production.up.railway.app/misCursos",
  "https://uade-store.vercel.app",
  "https://proyecto-react-shadcn.vercel.app",
  "https://biblioteca-uade.vercel.app",
  "https://desap2-eventos-front.onrender.com",
  "https://campus-connect-da-ii.up.railway.app",
  "https://backoffice-production-ui.up.railway.app",
]);

const LOCAL_BASE = "http://localhost:5173/";
const REDIRECT_KEY = "post_login_redirect_url";

function normalizeForWhitelist(raw: string) {
  try {
    const u = new URL(raw);
    u.hash = "";
    u.search = "";
    // NO tocamos pathname: algunos portales lo necesitan (/misCursos, etc.)
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function appendToken(url: string, token: string) {
  const u = new URL(url);
  u.searchParams.set("access_token", token);
  return u.toString();
}

function readRedirectUrlParam(): string | null {
  const qs = new URLSearchParams(window.location.search);
  const redirectUrl = qs.get("redirectUrl");
  if (!redirectUrl) return null;

  try {
    const decoded = decodeURIComponent(redirectUrl);
    return decoded;
  } catch {
    return redirectUrl;
  }
}

function getPreviousUrl(): string | null {
  // 1) prioridad: redirectUrl (tu caso nuevo)
  const redirectUrl = readRedirectUrlParam();
  if (redirectUrl) return redirectUrl;

  // 2) fallback: document.referrer
  if (document.referrer) return document.referrer;

  // 3) fallback: lo guardado en sesión
  return sessionStorage.getItem(REDIRECT_KEY);
}

export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const urlbase = "https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api";

  // Captura una vez el destino pedido por el portal (si existe)
  const requestedRedirect = useMemo(() => {
    const prev = getPreviousUrl();
    if (prev) sessionStorage.setItem(REDIRECT_KEY, prev);
    return prev;
  }, []);

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

      // token también en sesión local
      sessionStorage.setItem("external_access_token", data.access_token);

      const destination = requestedRedirect || sessionStorage.getItem(REDIRECT_KEY);

      // regla: si destination es el root local, ir a home
      if (destination === LOCAL_BASE) {
        navigate("/home", { replace: true });
        return;
      }

      // si destination pertenece a alguno de los portales, volver con token por queryparam
      if (destination) {
        const normalized = normalizeForWhitelist(destination);
        if (normalized && PORTAL_URLS.has(normalized)) {
          const target = appendToken(destination, data.access_token);
          sessionStorage.removeItem(REDIRECT_KEY);
          window.location.href = target;
          return;
        }
      }

      // default
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
