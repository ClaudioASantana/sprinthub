import { parseJwt } from './jwt';

// Story 032: access token curto + refresh token. Nenhuma página de fetch
// direto foi tocada aqui — isso é usado só no gate de autenticação do
// router (boot/navegação), que é onde a sessão precisa ficar viva.

const API_BASE = import.meta.env.VITE_API_URL || '';

// Renova um pouco antes de expirar de verdade, pra não perder a corrida
// contra a requisição que o usuário está prestes a fazer.
const REFRESH_MARGIN_SECONDS = 30;

export function getAccessToken(): string | null {
  return localStorage.getItem('token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

export function saveSession(data: {
  access_token: string;
  refresh_token?: string;
  user: unknown;
}): void {
  localStorage.setItem('token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('refresh_token', data.refresh_token);
  }
  localStorage.setItem('user', JSON.stringify(data.user));
}

export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

function isExpiredOrExpiringSoon(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + REFRESH_MARGIN_SECONDS * 1000;
}

/** Troca o refresh token salvo por um par novo. Limpa a sessão e devolve null em caso de falha. */
export async function refreshAccessToken(): Promise<string | null> {
  const refresh_token = getRefreshToken();
  if (!refresh_token) return null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    });

    if (!res.ok) {
      clearSession();
      return null;
    }

    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data.access_token as string;
  } catch {
    clearSession();
    return null;
  }
}

/** Devolve um access token válido, renovando via refresh token se preciso. Null se não há sessão possível. */
export async function ensureFreshToken(): Promise<string | null> {
  const token = getAccessToken();
  if (token && !isExpiredOrExpiringSoon(token)) {
    return token;
  }
  return refreshAccessToken();
}
