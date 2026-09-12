import axios from "axios";

// Este proyecto es independiente del panel administrativo (otro
// repo/deploy de Vercel), pero apunta al MISMO backend. La URL se
// configura con la variable de entorno VITE_API_URL (ver .env.example).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
