// useContinueSession.ts (completo) — ahora setea access_token Y refresh_token (si viene),
// y además mantiene external_access_token sincronizado.

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  getRefreshToken,
  isAccessTokenValid,
  isRefreshTokenValid,
} from "../utils";
import {
  captureRedirectUrlOnce,
  logoutLocal,
  withToken,
} from "../utils/url.handler";

const API_BASE = "https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api";

type Status = "idle" | "needs_confirm" | "refreshing" | "done" | "error";

type RefreshResponse = {
  success?: boolean;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  message?: string;
  error?: string;
  [k: string]: any;
};

function setTokensFromRefresh(data: RefreshResponse) {
  // access token (obligatorio)
  if (typeof data.access_token === "string" && data.access_token.trim()) {
    localStorage.setItem("access_token", data.access_token);
    sessionStorage.setItem("external_access_token", data.access_token);
    console.log("[TOKENS] access_token actualizado (local+session)");
  } else {
    throw new Error("Refresh OK pero sin access_token válido");
  }

  // refresh token (opcional: solo si tu backend lo rota)
  if (typeof data.refresh_token === "string" && data.refresh_token.trim()) {
    localStorage.setItem("refresh_token", data.refresh_token);
    console.log("[TOKENS] refresh_token actualizado (local)");
  } else {
    console.log("[TOKENS] refresh_token NO vino (se mantiene el existente)");
  }

  // extras (opcionales)
  if (typeof data.token_type === "string") {
    localStorage.setItem("token_type", data.token_type);
  }
  if (typeof data.expires_in === "number") {
    localStorage.setItem("expires_in", String(data.expires_in));
  }
}

async function refreshTokens(): Promise<RefreshResponse> {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken || !refreshToken) {
    throw new Error("No hay tokens para refrescar");
  }

  const resp = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
      refreshtoken: refreshToken,
    },
  });

  const data: RefreshResponse = await resp.json().catch(() => ({}));

  console.log("[REFRESH] status:", resp.status);
  console.log("[REFRESH] body:", data);

  if (!resp.ok || !data?.success) {
    const message =
      data?.message || data?.error || `Refresh falló (HTTP ${resp.status})`;
    throw new Error(message);
  }

  return data;
}

export function useContinueSession() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const interceptSubmitIfNeeded = useCallback((): boolean => {
    setError(null);

    const destino = captureRedirectUrlOnce();

    console.log("[CONTINUE] destino:", destino);
    console.log("[CONTINUE] access valid:", isAccessTokenValid());
    console.log("[CONTINUE] refresh valid:", isRefreshTokenValid());

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

    const destino = captureRedirectUrlOnce();
    console.log("[CONTINUE] confirm destino:", destino);

    if (!destino) {
      setStatus("error");
      setError("No hay destino (redirectUrl).");
      navigate("/home", { replace: true });
      return;
    }

    if (!isRefreshTokenValid()) {
      console.log("[CONTINUE] refresh inválido en confirm -> logout");
      logoutLocal();
      navigate("/", { replace: true });
      return;
    }

    try {
      const data = await refreshTokens();

      // ✅ acá se setean access_token y refresh_token (si viene)
      setTokensFromRefresh(data);

      const access = localStorage.getItem("access_token")!;
      const target = withToken(destino, access);

      console.log("[CONTINUE] redirect portal:", target);
      window.location.href = target;

      setStatus("done");
    } catch (e: any) {
      console.error("[CONTINUE] refresh error:", e);
      setError(e?.message ?? "Error al refrescar sesión");
      logoutLocal();
      navigate("/", { replace: true });
    }
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
  };
}
