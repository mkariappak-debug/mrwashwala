
import axios from "axios";

const apiUrl = (import.meta.env.VITE_API_URL || "").trim();
const isProduction = Boolean(import.meta.env.PROD);
const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const resolvedBaseUrl = isProduction
  ? (apiUrl || "/")
  : (apiUrl || (isLocalhost ? "http://localhost:5000" : "/"));

const API = axios.create({
  // In production, use VITE_API_URL from env (or same-origin fallback).
  // In development, default localhost backend if env is not set.
  baseURL: resolvedBaseUrl,
});

export default API;