
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "https://mrwashwala-server.onrender.com";

const API = axios.create({
  baseURL: apiUrl,
});

export default API;