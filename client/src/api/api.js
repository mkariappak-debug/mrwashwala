
import axios from "axios";

const apiUrl = (import.meta.env.VITE_API_URL || "").trim();

const API = axios.create({
  // If VITE_API_URL is not set, use same-origin so reverse proxy setups keep working.
  baseURL: apiUrl || "/",
});

export default API;