import { useStore } from "@/store/store";
import { CustomError } from "@/types/custom-error.type";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const accessToken = useStore.getState().accessToken;

  if (accessToken) {
    // FIX 1 → Add a space after Bearer
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config; // FIX 2 → MUST return config
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { data } = error.response || {};

    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

export default API;
