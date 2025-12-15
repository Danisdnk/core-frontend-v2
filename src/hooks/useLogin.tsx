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

const REDIRECT_KEY = "post_login_redirect_origin";
const LOCAL_BASE = "http://localhost:5173/";

function safeOrigin(raw: string): string | null {
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function appendTokenToOrigin(origin: string, token: string) {
  const u = new URL(origin);
  u.searchParams.set("access_token", token);
  return u.toString();
}

function isLocalRootRef(raw: string) {
  return raw === LOCAL_BASE || raw === "http://localhost:5173";
}

function isThisAppRootRef(raw: string) {
  try {
    const u = new URL(raw);
    return u.origin === window.location.origin && (u.pathname === "/" || u.pathname === "");
  } catch {
    return false;
  }
}

export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const urlbase = "https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api";

  const portalOriginOrSpecial = useMemo(() => {
    console.log("[LOGIN] document.referrer:", document.referrer);

    if (document.referrer) {
      const origin = safeOrigin(document.referrer);
      console.log("[LOGIN] referrer origin:", origin);

      if (origin && PORTAL_ORIGINS.has(origin)) {
        console.log("[LOGIN] Referrer es portal válido:", origin);
        sessionStorage.setItem(REDIRECT_KEY, origin);
        return origin;
      }

      if (isLocalRootRef(document.referrer) || isThisAppRootRef(document.referrer)) {
        console.log("[LOGIN] Referrer es root local o de la app");
        return document.referrer;
      }
    }

    const stored = sessionStorage.getItem(REDIRECT_KEY);
    console.log("[LOGIN] Fallback sessionStorage redirect:", stored);

    return stored;
  }, []);

  const login = async ({ email, password }: LoginCredentials) => {
    setLoading(true);
    setError(null);

    console.log("[LOGIN] Iniciando login con:", email);

    try {
      const response = await fetch(`${urlbase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log("[LOGIN] Respuesta auth:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Error de autenticación, verifique sus credenciales"
        );
      }

      if (!data.access_token) {
        throw new Error("No se recibió token de autenticación");
      }

      console.log("[LOGIN] Token recibido");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("token_type", data.token_type);
      localStorage.setItem("expires_in", data.expires_in.toString());

      sessionStorage.setItem("external_access_token", data.access_token);

      const storedOrigin = sessionStorage.getItem(REDIRECT_KEY);
      console.log("[LOGIN] storedOrigin:", storedOrigin);
      console.log("[LOGIN] portalOriginOrSpecial:", portalOriginOrSpecial);

      if (
        portalOriginOrSpecial &&
        (isLocalRootRef(portalOriginOrSpecial) ||
          isThisAppRootRef(portalOriginOrSpecial))
      ) {
        console.log("[LOGIN] Redirigiendo a /home (root detectado)");
        navigate("/home", { replace: true });
        return;
      }

      const finalOrigin =
        portalOriginOrSpecial && PORTAL_ORIGINS.has(portalOriginOrSpecial)
          ? portalOriginOrSpecial
          : storedOrigin && PORTAL_ORIGINS.has(storedOrigin)
          ? storedOrigin
          : null;

      console.log("[LOGIN] finalOrigin:", finalOrigin);

      if (finalOrigin) {
        const target = appendTokenToOrigin(finalOrigin, data.access_token);
        console.log("[LOGIN] Redirigiendo a portal:", target);
        sessionStorage.removeItem(REDIRECT_KEY);
        window.location.href = target;
        return;
      }

      console.log("[LOGIN] Redirigiendo default a /home");
      navigate("/home", { replace: true });
    } catch (err: any) {
      console.error("[LOGIN] Error:", err);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
      console.log("[LOGIN] Fin login");
    }
  };

  return { login, loading, error };
}
