import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// Injecter le token automatiquement dans chaque requête
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("petconnect_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer les erreurs globalement
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expiré → déconnecter
      localStorage.removeItem("petconnect_token");
      localStorage.removeItem("petconnect_user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default client;
