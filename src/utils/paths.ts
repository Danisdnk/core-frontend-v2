import { getAccessToken } from "./auth";

export function buildPathWithToken(path: string, token?: string | null): string {
  const t = token ?? getAccessToken();
  return `${path}${t ? `?token=${encodeURIComponent(t)}` : ""}`;
}
