import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

let isRefreshing = false;
let isRedirecting = false;

const refreshSubscribers = [];

function subscribeRefresh(callback) {
  refreshSubscribers.push(callback);
}

function notifyRefreshSubscribers(error) {
  refreshSubscribers.forEach((callback) => callback(error));
  refreshSubscribers.length = 0;
}

function redirectToHome() {
  if (typeof window === "undefined") return;

  if (isRedirecting) return;
  if (window.location.pathname === "/") return;
  isRedirecting = true;

  window.location.href = "/";

  setTimeout(() => {
    isRedirecting = false;
  }, 1000);
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (!error.response) {
      return Promise.reject(error);
    }

    if (originalRequest?.url === "/auth/refresh") {
      return Promise.reject(error);
    }

    const errorCode = error.response.data?.code;

    const code = error.response.data?.code;

    const shouldRefresh =
      error.response.status === 401 &&
      (code === "ACCESS_TOKEN_MISSING" || code === "ACCESS_TOKEN_EXPIRED");

    if (!shouldRefresh || originalRequest?.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeRefresh((refreshError) => {
          if (refreshError) {
            reject(refreshError);
          } else {
            originalRequest._retry = true;
            resolve(api(originalRequest));
          }
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await refreshClient.post("/auth/refresh");

      isRefreshing = false;

      notifyRefreshSubscribers(null);

      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;

      notifyRefreshSubscribers(refreshError);

      redirectToHome();

      return Promise.reject(refreshError);
    }
  },
);

export default api;
