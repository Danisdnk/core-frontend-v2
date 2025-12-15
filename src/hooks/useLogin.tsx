import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  appendToken,
  captureRedirectUrlOnce,
  log,
  safeUrl,
  REDIRECT_KEY,
} from "../utils/url.handler";

interface LoginCredentials {
  email: string;
  password: string;
}

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  loading: boolean;
  error: string | null;
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
