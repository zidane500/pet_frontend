interface UserAvatarProps {
  name?: string | null;
  avatar?: string | null;
  size?: number; // px
  className?: string;
}

// ← Même algorithme que celui déjà utilisé dans Navbar.tsx : initiale des
// deux premiers mots du nom. "gharbi buffon" → "GB".
export function getUserInitials(name?: string | null): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "?";

  return trimmed
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * ← Source unique pour l'affichage d'un avatar utilisateur dans toute
 * l'app. Avant ce composant, chaque écran (posts, commentaires, avis,
 * profil, messagerie...) réimplémentait sa propre logique de repli, et
 * la plupart utilisaient une photo aléatoire de picsum.photos au lieu
 * d'initiales quand l'utilisateur n'avait pas de photo — d'où les
 * photos qui n'ont rien à voir affichées sur les comptes sans avatar.
 */
export function UserAvatar({
  name,
  avatar,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const dimension = { width: size, height: size };

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name ?? "Avatar"}
        style={dimension}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name ?? "Avatar"}
      style={{
        ...dimension,
        background:
          "linear-gradient(135deg, var(--pc-primary) 0%, #10b981 100%)",
        fontSize: Math.max(Math.round(size * 0.38), 10),
      }}
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
    >
      {getUserInitials(name)}
    </div>
  );
}
