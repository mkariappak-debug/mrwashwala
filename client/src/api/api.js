
import axios from "axios";

const apiUrl = (import.meta.env.VITE_API_URL || "").trim();
const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const resolvedBaseUrl = apiUrl || (isLocalhost ? "http://localhost:5005" : "/");

const API = axios.create({
  // Env URL wins. In local dev, default to backend port 5000.
  // In production without env, use same-origin for reverse proxy setups.
  baseURL: resolvedBaseUrl,
});

export default API;