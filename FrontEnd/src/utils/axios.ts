import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { AUTH_SESSION_STORAGE_KEY } from "@/constants/authSession";

const baseURL = process.env.NEXT_PUBLIC_API ?? "";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

/** Không gắn interceptor refresh để tránh vòng lặp khi gọi token/refresh. */
const bareClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as { access?: string };
    return s?.access ?? null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = readAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryConfig = InternalAxiosRequestConfig & { _authRetry?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest || originalRequest._authRetry) {
      return Promise.reject(error);
    }

    const path = originalRequest.url ?? "";
    if (
      path.includes("auth/login") ||
      path.includes("auth/register") ||
      path.includes("auth/token/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._authRetry = true;

    const { getAuthSession, applyTokenRefresh, clearAuthSession } = await import("@/services/authService");
    const session = getAuthSession();
    if (!session?.refresh) {
      clearAuthSession();
      return Promise.reject(error);
    }

    try {
      const { data } = await bareClient.post<{ access: string; refresh?: string }>("auth/token/refresh/", {
        refresh: session.refresh,
      });
      applyTokenRefresh({ access: data.access, refresh: data.refresh });
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return api(originalRequest);
    } catch {
      clearAuthSession();
      return Promise.reject(error);
    }
  },
);

export default api;
