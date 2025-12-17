// src/hooks/useTokenExpiryModal.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAccessToken,
  getRefreshToken,
  getTokenValidityInfo,
  isRefreshTokenValid,
} from "../utils";
import { logoutLocal } from "../utils/url.handler";

const API_BASE = "https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api";

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
  if (typeof data.access_token === "string" && data.access_token.trim()) {
    localStorage.setItem("access_token", data.access_token);
    sessionStorage.setItem("external_access_token", data.access_token);
    console.log("[EXPIRY] access_token actualizado (local+session)");
  } else {
    throw new Error("Refresh OK pero sin access_token válido");
  }

  if (typeof data.refresh_token === "string" && data.refresh_token.trim()) {
    localStorage.setItem("refresh_token", data.refresh_token);
    console.log("[EXPIRY] refresh_token actualizado (local)");
  } else {
    console.log("[EXPIRY] refresh_token NO vino (se mantiene el existente)");
  }

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

  console.log("[EXPIRY] refresh status:", resp.status);
  console.log("[EXPIRY] refresh body:", data);

  if (!resp.ok || !data?.success) {
    const message =
      data?.message || data?.error || `Refresh falló (HTTP ${resp.status})`;
    throw new Error(message);
  }

  return data;
}

export function useTokenExpiryModal(options?: {
  thresholdSeconds?: number;
  checkEveryMs?: number;
  onLogoutRedirect?: () => void;
}) {
  const thresholdSeconds = options?.thresholdSeconds ?? 120;
  const checkEveryMs = options?.checkEveryMs ?? 15000;

  const [isOpen, setIsOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasToken = useMemo(() => Boolean(getAccessToken()), []);

  const check = useCallback(() => {
    const token = getAccessToken();

    if (!token) {
      console.log("[EXPIRY] no token -> cerrar modal");
      setIsOpen(false);
      setSecondsLeft(0);
      return;
    }

    const info = getTokenValidityInfo(token, 30);
    console.log("[EXPIRY] secondsLeft:", info.secondsLeft, "expired:", info.expired);

    setSecondsLeft(info.secondsLeft);

    if (info.expired) {
      console.log("[EXPIRY] access expirado -> logoutLocal");
      logoutLocal();
      options?.onLogoutRedirect?.();
      return;
    }

    if (info.secondsLeft <= thresholdSeconds) {
      console.log("[EXPIRY] por expirar -> abrir modal");
      setIsOpen(true);
    }
  }, [thresholdSeconds, options]);

  useEffect(() => {
    if (!hasToken) return;

    check();
    const id = window.setInterval(check, checkEveryMs);
    return () => window.clearInterval(id);
  }, [hasToken, check, checkEveryMs]);

  const renew = useCallback(async () => {
    setError(null);
    setIsBusy(true);

    try {
      if (!isRefreshTokenValid()) {
        throw new Error("Refresh token inválido");
      }

      const data = await refreshTokens();
      setTokensFromRefresh(data);

      check();
      setIsOpen(false);
    } catch (e: any) {
      console.error("[EXPIRY] renew error:", e);
      setError(e?.message ?? "Error al renovar sesión");
      logoutLocal();
      options?.onLogoutRedirect?.();
    } finally {
      setIsBusy(false);
    }
  }, [check, options]);

  const logout = useCallback(() => {
    console.log("[EXPIRY] logout");
    logoutLocal();
    setIsOpen(false);
    options?.onLogoutRedirect?.();
  }, [options]);

  const close = useCallback(() => {
    console.log("[EXPIRY] close modal");
    setIsOpen(false);
  }, []);

  // ✅ OPCIÓN A: helpers de debug
  const forceOpen = useCallback(() => {
    console.log("[EXPIRY] forceOpen");
    setError(null);
    setIsOpen(true);
  }, []);

  const forceCheck = useCallback(() => {
    console.log("[EXPIRY] forceCheck");
    check();
  }, [check]);

  return {
    isOpen,
    secondsLeft,
    isBusy,
    error,
    renew,
    logout,
    close,
    forceOpen,
    forceCheck,
  };
}
