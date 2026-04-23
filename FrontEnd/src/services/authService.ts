import api from "@/utils/axios";
import {
  AUTH_SESSION_CHANGED_EVENT,
  AUTH_SESSION_STORAGE_KEY,
} from "@/constants/authSession";

const LOGIN_PATH = "auth/login/";
const REGISTER_PATH = "auth/register/";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface AuthSessionUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  displayName: string;
}

export interface AuthSessionState {
  access: string;
  refresh: string;
  user: AuthSessionUser;
}

export { AUTH_SESSION_CHANGED_EVENT };

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(REGISTER_PATH, payload);
  return data;
}

export async function loginWithEmail(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(LOGIN_PATH, payload);
  return data;
}

export function createAuthSessionState(authResponse: AuthResponse): AuthSessionState {
  const { access, refresh, user } = authResponse;
  const displayName = user.first_name?.trim() || user.email;

  return {
    access,
    refresh,
    user: {
      ...user,
      displayName,
    },
  };
}

export function saveAuthSession(authResponse: AuthResponse): AuthSessionState {
  const state = createAuthSessionState(authResponse);
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
  return state;
}

export function getAuthSession(): AuthSessionState | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSessionState;
  } catch {
    return null;
  }
}

/** Cập nhật access (và refresh nếu server rotate). Dùng sau JWT refresh. */
export function applyTokenRefresh(tokens: { access: string; refresh?: string }): void {
  if (typeof window === "undefined") return;
  const cur = getAuthSession();
  if (!cur) return;
  const next: AuthSessionState = {
    ...cur,
    access: tokens.access,
    ...(tokens.refresh ? { refresh: tokens.refresh } : {}),
  };
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function clearAuthSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
}
