import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// Injecter le token depuis sessionStorage
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
      // ignore
    }
  }
  return config;
});

// ── Anti-boucle : évite de déclencher plusieurs déconnexions en rafale ──
let sessionExpiredHandled = false;

// À appeler après une connexion réussie, pour réarmer la détection
// d'expiration de session (sinon elle ne se déclencherait qu'une seule
// fois par cycle de vie de l'onglet).
export function resetSessionExpiredFlag(): void {
  sessionExpiredHandled = false;
}

// Endpoints où un 401 est un échec de connexion NORMAL (mauvais mot de
// passe / pas encore connecté), pas une session expirée. Il ne faut PAS
// forcer de déconnexion/redirection dans ce cas.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/me"];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((path) => url.includes(path));
}

// Gérer les erreurs globalement
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url as string | undefined;

    if (status === 401 && !isAuthEndpoint(url) && !sessionExpiredHandled) {
      sessionExpiredHandled = true;
      sessionStorage.removeItem("petconnect_user");

      // ⚠️ IMPORTANT : on NE FAIT PLUS `window.location.href` ici.
      // Ça provoquait un rechargement complet de page, qui relançait
      // l'app depuis zéro et pouvait re-déclencher un 401 immédiatement
      // → boucle de rechargement infinie.
      //
      // À la place, on émet un simple événement DOM. App.tsx (qui a
      // accès au store d'auth et à React Router) l'écoute et fait une
      // navigation SPA propre vers /login, sans recharger la page.
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }

    return Promise.reject(error);
  },
);

export default client;
