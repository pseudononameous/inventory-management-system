/// <reference types="vite/client" />

import axios, { AxiosError, HttpStatusCode } from "axios";
import { notifications } from "@mantine/notifications";
import { API_HOST } from "@config/api";

axios.defaults.baseURL = API_HOST;
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("ims-auth")
    ? (JSON.parse(localStorage.getItem("ims-auth") ?? "{}")?.state?.token as string | undefined)
    : undefined;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let lastUnauthorizedToastTime = 0;
const UNAUTHORIZED_TOAST_COOLDOWN = 5000;

function shouldShowUnauthorizedToast(): boolean {
  const now = Date.now();
  if (now - lastUnauthorizedToastTime > UNAUTHORIZED_TOAST_COOLDOWN) {
    lastUnauthorizedToastTime = now;
    return true;
  }
  return false;
}

axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response?.data as { message?: string } | undefined;
      const errorMessage = errorData?.message;

      switch (status) {
        case HttpStatusCode.Unauthorized:
          if (shouldShowUnauthorizedToast()) {
            notifications.show({
              title: "Unauthorized",
              message: errorMessage || "Your session has expired. Please log in again.",
              color: "red",
              autoClose: 3000,
            });
          }
          break;
        case HttpStatusCode.Forbidden:
          notifications.show({
            title: "Forbidden",
            message: errorMessage || "You do not have permission to access this resource.",
            color: "red",
            autoClose: 3000,
          });
          break;
        default:
          notifications.show({
            title: "Error",
            message: errorMessage ?? "An error occurred.",
            color: "red",
            autoClose: 5000,
          });
      }
    } else if (error.code === "ERR_NETWORK") {
      notifications.show({
        title: "Network Error",
        message: "Unable to connect to the server.",
        color: "red",
        autoClose: 5000,
      });
    }
    return Promise.reject(error);
  }
);

export default axios;
