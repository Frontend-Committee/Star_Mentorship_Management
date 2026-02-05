// src/lib/api.ts
import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from "./auth";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL = import.meta.env.DEV
  ? "/api"
  : "https://starunion.pythonanywhere.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  if (config.headers && typeof (config.headers as AxiosHeaders).set === "function") {
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  } else {
    config.headers = new AxiosHeaders(config.headers);
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) setAuthHeader(config, token);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const url = originalRequest?.url ?? "";

    // Exclude auth-specific routes from token retry
    // But allow DELETE auth/users/{id}/ (delete member) to be retried
    const isAuthRoute =
      url.includes("auth/login/") ||
      url.includes("auth/token/refresh/") ||
      (url.includes("auth/users/") && originalRequest.method?.toUpperCase() === 'POST');

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const refreshUrl = import.meta.env.DEV
          ? "/api/auth/token/refresh/"
          : "https://starunion.pythonanywhere.com/api/auth/token/refresh/";

        const refreshRes = await axios.post(
          refreshUrl,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { access } = refreshRes.data as { access: string };
        setAccessToken(access);

        // Retry original request with new token
        setAuthHeader(originalRequest, access);
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
