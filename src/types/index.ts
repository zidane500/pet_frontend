export interface User {
  id: number;
  name: string;
  email: string;
  role: "owner" | "vet" | "shop" | "shelter" | "breeder" | "admin";
  phone?: string | null;
  city?: string | null;
  region?: string | null;
  avatar?: string | null;
  bio?: string | null;
  plan: "free" | "basic" | "premium" | "pro";
  is_verified: boolean;
  is_active: boolean;
  locale: string;
  created_at: string;
}

export type ListingStatus =
  | "active"
  | "paused"
  | "sold"
  | "adopted"
  | "expired"
  | "pending";

export interface Listing {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  type: "adoption" | "vente" | "perdu" | "trouve" | "accouplement" | "conseils";
  status?: ListingStatus | null;
  species?: string | null;
  breed?: string | null;
  age_months?: number | null;
  price?: number | string | null;
  is_free: boolean;
  city?: string | null;
  region?: string | null;
  photos?: string[] | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  is_vaccinated: boolean;
  is_sterilized: boolean;
  is_premium: boolean;
  is_active: boolean;
  views_count: number;
  expires_at?: string | null;
  created_at: string;
  user?: User;
}

export interface LostFound {
  id: number;
  user_id: number;
  type: "lost" | "found";
  animal_name?: string | null;
  species: string;
  breed?: string | null;
  color?: string | null;
  description?: string | null;
  last_seen_location: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  date_lost_found: string;
  photos?: string[] | null;
  contact_phone?: string | null;
  is_resolved: boolean;
  created_at: string;
  user?: User;
}

export interface Vet {
  id: number;
  clinic_name: string;
  doctor_name: string;
  speciality?: string | null;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  region?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  opening_hours?: Record<string, string> | null;
  services?: string[] | null;
  photo?: string | null;
  is_verified: boolean;
  is_active?: boolean;
  rating: number | string;
  reviews_count: number;
}

export interface PetStore {
  id: number;
  store_name: string;
  description?: string | null;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  region?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  opening_hours?: Record<string, string> | null;
  services?: string[] | null;
  logo?: string | null;
  photos?: string[] | null;
  is_verified: boolean;
  is_active?: boolean;
  rating: number | string;
  reviews_count: number;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  listing_id?: number | null;
  content: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  sender?: Pick<User, "id" | "name" | "avatar">;
  receiver?: Pick<User, "id" | "name" | "avatar">;
  listing?: Pick<Listing, "id" | "title" | "type"> | null;
}

export interface ConversationSummary {
  partner: Pick<User, "id" | "name" | "avatar" | "is_verified">;
  last_message: Message;
  unread_count: number;
}

export interface AppNotificationData {
  title?: string;
  body?: string;
  icon?: string;
  category?: "messages" | "annonces" | "adoptions" | "systeme";
  action_type?: "message" | "listing" | "profile" | "none";
  action_id?: number | string | null;
  avatar?: string | null;
}

export interface AppNotification {
  id: string;
  type: string;
  data: AppNotificationData;
  read_at?: string | null;
  created_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user?: User;
}

export interface Favorite {
  id: number;
  user_id: number;
  favoritable_type: string;
  favoritable_id: number;
  favoritable?: Listing | Vet | PetStore;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DashboardChartPoint {
  day: string;
  count?: number;
  views?: number;
}

export interface DashboardData {
  user: User;
  listings_count: number;
  active_listings: number;
  total_views: number;
  unread_messages: number;
  favorites_count: number;
  unread_notifications: number;
  recent_listings: Listing[];
  views_by_listing: DashboardChartPoint[];
  messages_by_day: DashboardChartPoint[];
}
