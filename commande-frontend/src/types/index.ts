// Types pour les statuts des produits
export type ProductStatus = 'best_seller' | 'new' | 'on_sale';

export interface ProductStatusInfo {
  value: ProductStatus;
  label: string;
  emoji: string;
  color: string;
}

// Types pour l'affichage frontend (existants)
export interface Product {
  id: string;
  name: string;
  description?: string; // Description du produit
  price: number;
  originalPrice?: number;
  image: string; // Image principale (pour compatibilité)
  images?: string[]; // Toutes les images (optionnel)
  rating: number;
  reviews: number;
  category: string;
  categoryId?: string;
  subcategoryId?: string;
  subcategory?: string;
  isNew?: boolean;
  isPromo?: boolean;
  isBestSeller?: boolean;
  freeShipping?: boolean;
  stock?: number; // Stock disponible
}

export interface Category {
  id: string;
  name: string;
  subcategories?: {
    id: string;
    name: string;
  }[];
}

// Types étendus pour l'administration
export interface AdminProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  subcategory_id?: number;
  images?: string[];
  is_active: boolean;
  stock: number;
  status?: ProductStatus[];
  supplier_company?: string;
  supplier_phone?: string;
  supplier_address?: string;
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  created_at: string;
  updated_at: string;
  category?: AdminCategory;
  subcategory?: AdminSubcategory;
  original_price?: number;
  is_featured?: boolean;
}

export interface AdminCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  image?: string;
  created_at: string;
  updated_at: string;
  products_count?: number;
  subcategories_count?: number;
}

export interface AdminSubcategory {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  is_active: boolean;
  image?: string;
  created_at: string;
  updated_at: string;
  category?: AdminCategory;
  products_count?: number;
}

// Types pour les formulaires
export interface CategoryFormData {
  name: string;
  description?: string;
  is_active: boolean;
  image?: string;
}

export interface SubcategoryFormData {
  name: string;
  description?: string;
  category_id: number;
  is_active: boolean;
  image?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  category_id: number;
  subcategory_id?: number;
  images?: string[];
  is_active: boolean;
  stock: number;
  status?: ProductStatus[];
  supplier_company?: string;
  supplier_phone?: string;
  supplier_address?: string;
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
}

// Types pour le système de paiement par partenaires
export interface City {
  id: number;
  name: string;
  code: string;
  country: string;
  is_active: boolean;
  neighborhoods_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Neighborhood {
  id: number;
  name: string;
  city_id: number;
  is_active: boolean;
  city?: City;
  created_at: string;
  updated_at: string;
}

export interface PartnerData {
  id: number;
  user_id: number;
  business_name: string;
  business_phone: string;
  business_address: string;
  city_id: number;
  neighborhood_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commission_rate: number;
  approved_at?: string;
  rejection_reason?: string;
  city?: City;
  neighborhood?: Neighborhood;
  user?: { id: number; name: string; email: string };
  created_at: string;
  updated_at: string;
}

export interface PaymentCode {
  id: number;
  code: string;
  partner_id: number;
  order_id: number;
  amount: number;
  status: 'pending' | 'validated' | 'expired' | 'cancelled';
  expires_at: string;
  validated_at?: string;
  partner?: PartnerData;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  partner_id: number;
  payment_code_id: number;
  client_id: number;
  amount: number;
  partner_commission: number;
  status: string;
  order?: { id: number; total_amount: number };
  partner?: PartnerData;
  created_at: string;
  updated_at: string;
}

// Types pour le système de devis
export interface DeliveryZone {
  id: number;
  name: string;
  city_id: number;
  base_price: number;
  price_per_kg: number;
  price_per_m3: number;
  max_weight_kg: number;
  max_volume_m3: number;
  is_active: boolean;
  city?: City;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  weight_kg?: number;
  volume_m3?: number;
}

export interface Quote {
  id: number;
  reference: string;
  user_id?: number;
  delivery_zone_id: number;
  items: QuoteItem[];
  subtotal_products: number;
  total_weight_kg: number;
  total_volume_m3: number;
  delivery_cost: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'expired';
  expires_at: string;
  notes?: string;
  delivery_zone?: DeliveryZone;
  created_at: string;
  updated_at: string;
}

// Types pour les filtres et recherche
export interface AdminFilters {
  search?: string;
  status?: 'active' | 'inactive' | '';
  category_id?: number;
  subcategory_id?: number;
  page?: number;
  per_page?: number;
}

// Types pour les réponses API
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  subcategoryId?: number;
  rating: number;
  freeShipping: boolean;
  sort: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'bestseller';
}