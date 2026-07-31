// ← Convertisseur "page logique" → URL réelle. Source UNIQUE : ce fichier
// existait auparavant en double (une copie dans router.tsx, une autre
// dans App.tsx), ce qui a causé des boutons qui semblaient corrigés dans
// un fichier mais pas dans l'autre (ex: "vets", "boutique-detail").
// Ne plus dupliquer cette fonction ailleurs — toujours importer d'ici.
export function pageToPath(
  page: string,
  params?: Record<string, string>,
): string {
  switch (page) {
    case "home":
      return "/";
    case "search":
      return params?.q
        ? `/search?q=${encodeURIComponent(params.q)}${params.type ? `&type=${params.type}` : ""}`
        : `/search${params?.type ? `?type=${params.type}` : ""}`;
    case "feed":
      return params?.postId ? `/feed/${params.postId}` : "/feed";
    case "dashboard":
      return "/dashboard";
    case "messages":
      return params?.userId ? `/messages/${params.userId}` : "/messages";
    case "create-listing":
      return "/create-listing";
    case "pet-detail":
      return `/listings/${params?.id ?? ""}`;
    case "profile":
      return params?.id ? `/profile/${params.id}` : "/profile";
    case "notifications":
      return "/notifications";
    case "favorites":
      return "/favorites";
    case "saved-posts":
      return "/saved-posts";
    case "premium":
      return "/premium";
    case "settings":
      return "/settings";
    case "vet-profile":
      return `/vets/${params?.id ?? ""}`;
    case "vets":
      return "/vets";
    case "shop-profile":
      return `/stores/${params?.id ?? ""}`;
    case "shelter-profile":
      return `/shelters/${params?.id ?? ""}`;
    case "boutique":
      return "/boutique";
    case "boutique-detail":
      return `/boutique/${params?.id ?? ""}`;
    case "cart":
      return "/panier";
    case "faq":
      return "/faq";
    case "contact":
      return "/contact";
    case "login":
      return "/login";
    case "register":
      return "/register";
    case "profile-setup":
      return "/profile-setup";
    default:
      return "/";
  }
}
