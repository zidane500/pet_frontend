export interface User {
  id: number;
  name: string;
  email: string;
  role: "owner" | "vet" | "shop" | "shelter" | "breeder";
  phone?: string;
  city?: string;
  region?: string;
  avatar?: string;
  bio?: string;
  plan: "free" | "basic" | "premium" | "pro";
  is_verified: boolean;
  is_active: boolean;
  locale: string;
  created_at: string;
}

export interface Listing {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  type: "adoption" | "vente" | "perdu" | "trouve" | "accouplement" | "conseils";
  species?: string;
  breed?: string;
  age_months?: number | null;
  price?: number;
  is_free: boolean;
  city?: string;
  region?: string;
  photos?: string[];
  contact_phone?: string;
  contact_email?: string;
  is_vaccinated: boolean;
  is_sterilized: boolean;
  is_premium: boolean;
  is_active: boolean;
  views_count: number;
  expires_at?: string;
  created_at: string;
  user?: User;
}

export interface LostFound {
  id: number;
  user_id: number;
  type: "lost" | "found";
  animal_name?: string;
  species: string;
  breed?: string;
  color?: string;
  description?: string;
  last_seen_location: string;
  latitude?: number;
  longitude?: number;
  date_lost_found: string;
  photos?: string[];
  contact_phone?: string;
  is_resolved: boolean;
  created_at: string;
  user?: User;
}

export interface Vet {
  id: number;
  clinic_name: string;
  doctor_name: string;
  speciality?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: Record<string, string>;
  services?: string[];
  photo?: string;
  is_verified: boolean;
  rating: number;
  reviews_count: number;
}

export interface PetStore {
  id: number;
  store_name: string;
  description?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  region?: string;
  logo?: string;
  photos?: string[];
  is_verified: boolean;
  rating: number;
  reviews_count: number;
  services?: string[];
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  listing_id?: number;
  content: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender?: User;
  receiver?: User;
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

export interface DashboardData {
  user: User;
  listings_count: number;
  active_listings: number;
  total_views: number;
  unread_messages: number;
  recent_listings: Listing[];
}
