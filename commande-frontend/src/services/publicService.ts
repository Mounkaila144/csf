import { getFullImageUrl } from './adminService';
import { ProductStatus } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Types pour l'API publique
export interface PublicProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  stock: number;
  status?: ProductStatus[];
  category_id: number;
  subcategory_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
  };
  subcategory?: {
    id: number;
    name: string;
    description?: string;
    category_id: number;
    is_active: boolean;
  };
}

export interface PublicCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products_count?: number;
  subcategories?: PublicSubcategory[];
}

export interface PublicSubcategory {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products_count?: number;
}

interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

class PublicService {
  private async handleResponse<T>(response: Response): Promise<T> {
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    return result;
  }

  // ==================== PRODUCTS ====================
  
  async getProducts(page = 1, perPage = 12, filters?: {
    category_id?: number;
    subcategory_id?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    sort_by?: string;
    sort_order?: string;
  }): Promise<PaginatedResponse<PublicProduct>> {
    let url = `${API_BASE_URL}/products?page=${page}&per_page=${perPage}`;
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse<PaginatedResponse<PublicProduct>>(response);
  }

  async getProduct(id: number): Promise<ApiResponse<PublicProduct>> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse<ApiResponse<PublicProduct>>(response);
  }

  async getFeaturedProducts(): Promise<ApiResponse<PublicProduct[]>> {
    const response = await fetch(`${API_BASE_URL}/products/featured/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse<ApiResponse<PublicProduct[]>>(response);
  }

  async getBestSellers(): Promise<ApiResponse<PublicProduct[]>> {
    const response = await fetch(`${API_BASE_URL}/products/best-sellers/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse<ApiResponse<PublicProduct[]>>(response);
  }

  async getNewProducts(): Promise<ApiResponse<PublicProduct[]>> {
    const response = await fetch(`${API_BASE_URL}/products/new/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse<ApiResponse<PublicProduct[]>>(response);
  }

  async getOnSaleProducts(): Promise<ApiResponse<PublicProduct[]>> {
    const response = await fetch(`${API_BASE_URL}/products/on-sale/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse<ApiResponse<PublicProduct[]>>(response);
  }

  async getProductsByStatus(status: ProductStatus): Promise<PaginatedResponse<PublicProduct>> {
    const response = await fetch(`${API_BASE_URL}/products/status/${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse<PaginatedResponse<PublicProduct>>(response);
  }

  // ==================== CATEGORIES ====================
  
  async getActiveCategories(): Promise<ApiResponse<PublicCategory[]>> {
    const response = await fetch(`${API_BASE_URL}/categories/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse<ApiResponse<PublicCategory[]>>(response);
  }

  async getActiveSubcategories(): Promise<ApiResponse<PublicSubcategory[]>> {
    const response = await fetch(`${API_BASE_URL}/subcategories/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse<ApiResponse<PublicSubcategory[]>>(response);
  }

  async getSubcategoriesByCategory(categoryId: number): Promise<ApiResponse<PublicSubcategory[]>> {
    const response = await fetch(`${API_BASE_URL}/subcategories/category/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse<ApiResponse<PublicSubcategory[]>>(response);
  }

  // ==================== UTILITY ====================
  
  // Convertir un produit de l'API vers le format attendu par les composants existants
  convertToFrontendProduct(apiProduct: PublicProduct): Product {
    const status = apiProduct.status || [];
    return {
      id: apiProduct.id.toString(),
      name: apiProduct.name,
      price: parseFloat(apiProduct.price.toString()),
      originalPrice: undefined, // Pas encore implémenté dans l'API
      image: apiProduct.images && apiProduct.images.length > 0 ? getFullImageUrl(apiProduct.images[0]) : '/placeholder-product.jpg',
      rating: 4.5, // Valeur par défaut, à implémenter dans l'API
      reviews: 0, // Valeur par défaut, à implémenter dans l'API
      category: apiProduct.category?.name || 'Non catégorisé',
      categoryId: apiProduct.category_id.toString(),
      subcategoryId: apiProduct.subcategory_id?.toString(),
      subcategory: apiProduct.subcategory?.name,
      isNew: status.includes('new'),
      isPromo: status.includes('on_sale'),
      isBestSeller: status.includes('best_seller'),
      freeShipping: false, // À implémenter dans l'API
      status: status, // Ajout du champ status
    };
  }

  // Convertir une catégorie de l'API vers le format attendu par les composants existants
  convertToFrontendCategory(apiCategory: PublicCategory): Category {
    return {
      id: apiCategory.id.toString(),
      name: apiCategory.name,
      subcategories: apiCategory.subcategories?.map(sub => ({
        id: sub.id.toString(),
        name: sub.name
      })) || []
    };
  }
}

export const publicService = new PublicService();