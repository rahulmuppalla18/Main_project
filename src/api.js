
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// helper to set/unset Authorization header
export function setAuthToken(token) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

// global response interceptor: emit event on 401 so app can react (logout)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // broadcast a global event the app listens for
      window.dispatchEvent(new CustomEvent("app:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export default api;
