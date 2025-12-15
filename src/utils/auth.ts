export interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  iat?: number;
  exp?: number;
  career?: { uuid?: string; name?: string };
  [key: string]: any;
}

export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return null;
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function getUserFromToken(): { role: string | null; name: string } {
  const token = getAccessToken();
  const payload = token ? decodeJwtPayload(token) : null;
  const role =
    payload?.role?.toUpperCase?.() ??
    payload?.rol?.toUpperCase?.() ??
    payload?.Role?.toUpperCase?.() ??
    null;
  const name = payload?.name ?? payload?.nombre ?? "Usuario";
  return { role, name };
}

export function decodeJwtUtf8(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder("utf-8").decode(bytes);

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function formatUnixTimestamp(seconds?: number): string | undefined {
  return typeof seconds === "number"
    ? new Date(seconds * 1000).toLocaleString()
    : undefined;
}

export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeJwtUtf8(token);
  if (!payload) return true;
  if (typeof payload.exp !== "number") return true;

  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp - skewSeconds;
}

export function isAccessTokenValid(skewSeconds = 30): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return !isJwtExpired(token, skewSeconds);
}

export function getTokenValidityInfo(token: string, skewSeconds = 30) {
  const payload = decodeJwtUtf8(token);
  if (!payload || typeof payload.exp !== "number") {
    return {
      valid: false,
      expired: true,
      exp: undefined,
      expiresAt: undefined,
      secondsLeft: 0,
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = payload.exp - now;

  const expired = now >= payload.exp - skewSeconds;

  return {
    valid: !expired,
    expired,
    exp: payload.exp,
    expiresAt: formatUnixTimestamp(payload.exp),
    secondsLeft: Math.max(0, secondsLeft),
  };
}
