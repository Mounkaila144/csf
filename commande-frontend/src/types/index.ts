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
  price: number;
  originalPrice?: number;
  image: string;
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
  image?: string;
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
  status: 'active' | 'inactive';
  image?: string;
}

export interface SubcategoryFormData {
  name: string;
  description?: string;
  category_id: number;
  status: 'active' | 'inactive';
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
  subcategoryId?: number;
  rating: number;
  freeShipping: boolean;
  sort: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'bestseller';
}