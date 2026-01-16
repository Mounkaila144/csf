import { getFullImageUrl } from './adminService';
import { ProductStatus, Product, Category } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
    console.log('🔄 [publicService] Conversion du produit:', apiProduct.id, apiProduct.name);
    console.log('💰 [publicService] Prix brut reçu:', apiProduct.price, 'Type:', typeof apiProduct.price);
    
    const status = apiProduct.status || [];
    
    // Dédupliquer les images (enlever les doublons)
    const rawImages = apiProduct.images && apiProduct.images.length > 0
      ? apiProduct.images
      : [];
    
    // Utiliser un Set pour éliminer les doublons, puis reconvertir en tableau
    const uniqueImages = Array.from(new Set(rawImages));
    
    const fullImageUrls = uniqueImages.map(img => getFullImageUrl(img));

    // Convertir le prix avec validation
    let price = 0;
    if (apiProduct.price !== undefined && apiProduct.price !== null) {
      console.log('💵 [publicService] Prix avant conversion:', apiProduct.price);
      const parsedPrice = parseFloat(apiProduct.price.toString());
      console.log('💵 [publicService] Prix après parseFloat:', parsedPrice);
      
      // ⚠️ CORRECTION: Si le prix est très petit (< 1), c'est probablement en centimes
      // On le multiplie par 100 pour avoir le prix en yuan
      if (parsedPrice > 0 && parsedPrice < 1) {
        console.warn('⚠️ [publicService] Prix en centimes détecté, conversion en yuan:', parsedPrice, '→', parsedPrice * 100);
        price = parsedPrice * 100;
      } else {
        price = isNaN(parsedPrice) ? 0 : parsedPrice;
      }
      
      console.log('💵 [publicService] Prix final:', price);
    } else {
      console.warn('⚠️ [publicService] Prix undefined ou null pour le produit:', apiProduct.id, apiProduct.name);
    }

    // Log pour déboguer les prix manquants
    if (price === 0) {
      console.warn(`⚠️ [publicService] Produit ${apiProduct.id} (${apiProduct.name}) a un prix invalide:`, apiProduct.price);
    }

    const convertedProduct = {
      id: apiProduct.id.toString(),
      name: apiProduct.name,
      description: apiProduct.description,
      price: price,
      originalPrice: undefined, // Pas encore implémenté dans l'API
      image: fullImageUrls.length > 0 ? fullImageUrls[0] : '/placeholder-product.jpg',
      images: fullImageUrls.length > 0 ? fullImageUrls : undefined,
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
      stock: apiProduct.stock,
    };

    console.log('✅ [publicService] Produit converti:', convertedProduct);
    console.log('💰 [publicService] Prix dans le produit converti:', convertedProduct.price);

    return convertedProduct;
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