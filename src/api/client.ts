import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// Injecter le token automatiquement depuis sessionStorage
client.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem("petconnect_user");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore si le JSON est corrompu
    }
  }
  return config;
});

// Gérer les erreurs globalement
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expiré ou invalide → nettoyer sessionStorage et rediriger
      sessionStorage.removeItem("petconnect_user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default client;
