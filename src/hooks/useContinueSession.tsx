import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  getRefreshToken,
  isAccessTokenValid,
  isRefreshTokenValid,
} from "../utils";
import { REDIRECT_KEY } from "../utils/url.handler";

const API_BASE = "https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api";

type Status = "idle" | "needs_confirm" | "refreshing" | "done" | "error";

function logoutLocal() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("expires_in");
  sessionStorage.removeItem("external_access_token");
  sessionStorage.removeItem(REDIRECT_KEY);
}

function withToken(destino: string, token: string): string {
  const u = new URL(destino);
  u.searchParams.set("access_token", token);
  return u.toString();
}

async function refreshAccessToken(): Promise<string | null> {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!accessToken || !refreshToken) return null;

  const resp = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await resp.json().catch(() => null);
  const newAccess =
    data?.access_token ||
    data?.accessToken ||
    data?.token ||
    data?.data?.access_token ||
    null;

  if (!resp.ok || !newAccess) return null;
  return String(newAccess);
}

export function useContinueSession() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const interceptSubmitIfNeeded = useCallback((): boolean => {
    setError(null);

    const destino = sessionStorage.getItem(REDIRECT_KEY);

    console.log("[CONTINUE] destino:", destino);
    console.log("[CONTINUE] access:", !!getAccessToken(), "valid:", isAccessTokenValid());
    console.log("[CONTINUE] refresh:", !!getRefreshToken(), "valid:", isRefreshTokenValid());

    if (!destino) return false;

    if (!isRefreshTokenValid()) {
      console.log("[CONTINUE] refresh inválido -> logoutLocal");
      logoutLocal();
      return false;
    }

    if (!isAccessTokenValid()) {
      console.log("[CONTINUE] access inválido -> login normal");
      return false;
    }

    console.log("[CONTINUE] condiciones OK -> abrir modal");
    setStatus("needs_confirm");
    return true;
  }, []);

  const confirmContinue = useCallback(async () => {
    setError(null);
    setStatus("refreshing");

    const destino = sessionStorage.getItem(REDIRECT_KEY);
    console.log("[CONTINUE] confirmContinue destino:", destino);

    if (!destino) {
      setStatus("error");
      setError("No hay destino (redirectUrl) en sesión.");
      navigate("/home", { replace: true });
      return;
    }

    if (!isRefreshTokenValid()) {
      console.log("[CONTINUE] refresh inválido en confirm -> logout");
      logoutLocal();
      navigate("/", { replace: true }); 
      return;
    }

    const newAccess = await refreshAccessToken();
    console.log("[CONTINUE] newAccess recibido:", !!newAccess);

    if (!newAccess) {
      logoutLocal();
      navigate("/", { replace: true }); 
      return;
    }

    localStorage.setItem("access_token", newAccess);
    sessionStorage.setItem("external_access_token", newAccess);

    sessionStorage.removeItem(REDIRECT_KEY);

    const target = withToken(destino, newAccess);
    console.log("[CONTINUE] redirect portal:", target);
    window.location.href = target;

    setStatus("done");
  }, [navigate]);

  const cancelContinue = useCallback(() => {
    console.log("[CONTINUE] cancel -> logout + /");
    logoutLocal();
    setStatus("idle");
    navigate("/", { replace: true }); 
  }, [navigate]);

  return {
    status,
    error,
    isModalOpen: status === "needs_confirm",
    isBusy: status === "refreshing",
    interceptSubmitIfNeeded,
    confirmContinue,
    cancelContinue,
    getDestino: () => sessionStorage.getItem(REDIRECT_KEY),
  };
}
