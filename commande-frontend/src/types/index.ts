// Types pour l'affichage frontend (existants)
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  isNew?: boolean;
  isPromo?: boolean;
  isBestSeller?: boolean;
  freeShipping?: boolean;
}

export interface Category {
  id: string;
  name: string;
  subcategories?: string[];
}

// Types étendus pour l'administration
export interface AdminProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id: number;
  subcategory_id?: number;
  image?: string;
  status: 'active' | 'inactive';
  is_featured: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  category?: AdminCategory;
  subcategory?: AdminSubcategory;
}

export interface AdminCategory {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  products_count?: number;
}

export interface AdminSubcategory {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  category?: AdminCategory;
  products_count?: number;
}

// Types pour les formulaires
export interface CategoryFormData {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface SubcategoryFormData {
  name: string;
  description?: string;
  category_id: number;
  status: 'active' | 'inactive';
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id: number;
  subcategory_id?: number;
  image?: string;
  status: 'active' | 'inactive';
  is_featured: boolean;
  stock_quantity: number;
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
  from: number;
  to: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  rating: number;
  freeShipping: boolean;
  sort: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'bestseller';
}