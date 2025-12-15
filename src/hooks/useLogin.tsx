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

const PORTAL_ORIGINS = new Set<string>([
  "https://campus-connect-front-docentes.vercel.app",
  "https://student-portal-front-production.up.railway.app",
  "https://uade-store.vercel.app",
  "https://proyecto-react-shadcn.vercel.app",
  "https://biblioteca-uade.vercel.app",
  "https://desap2-eventos-front.onrender.com",
  "https://campus-connect-da-ii.up.railway.app",
  "https://backoffice-production-ui.up.railway.app",
]);

const LOCAL_BASE = "http://localhost:5173/";
const REDIRECT_KEY = "post_login_redirect_url";

function readRedirectUrlParam(): string | null {
  const qs = new URLSearchParams(window.location.search);
  const redirectUrl = qs.get("redirectUrl");
  if (!redirectUrl) return null;

  try {
    return decodeURIComponent(redirectUrl);
  } catch {
    return redirectUrl;
  }
}

function safeOrigin(raw: string): string | null {
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function isLocalBase(raw: string) {
  return raw === LOCAL_BASE || raw === "http://localhost:5173";
}

function appendToken(url: string, token: string) {
  const u = new URL(url);
  u.searchParams.set("access_token", token);
  return u.toString();
}

export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const urlbase = "https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api";

  const requestedRedirect = useMemo(() => {
    const url = readRedirectUrlParam();
    console.log("[LOGIN] redirectUrl param:", url);

    if (url) sessionStorage.setItem(REDIRECT_KEY, url);
    return url;
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
        throw new Error(
          data?.message ||
            data?.error ||
            "Error de autenticación, verifique sus credenciales"
        );
      }

      if (!data.access_token) throw new Error("No se recibió token de autenticación");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("token_type", data.token_type);
      localStorage.setItem("expires_in", data.expires_in.toString());

      sessionStorage.setItem("external_access_token", data.access_token);

      const dest = requestedRedirect || sessionStorage.getItem(REDIRECT_KEY);
      console.log("[LOGIN] dest (redirect):", dest);

      if (dest) {
        if (isLocalBase(dest)) {
          console.log("[LOGIN] dest es localhost root => /home");
          navigate("/home", { replace: true });
          return;
        }

        const origin = safeOrigin(dest);
        console.log("[LOGIN] dest origin:", origin);

        if (origin && PORTAL_ORIGINS.has(origin)) {
          const target = appendToken(dest, data.access_token);
          console.log("[LOGIN] redirect a portal:", target);
          sessionStorage.removeItem(REDIRECT_KEY);
          window.location.href = target;
          return;
        }
      }

      navigate("/home", { replace: true });
    } catch (err: any) {
      console.error("[LOGIN] Error:", err);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
