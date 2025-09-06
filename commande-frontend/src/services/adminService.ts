const API_BASE_URL = 'http://localhost:8000/api';

// Types pour les réponses API
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Types pour les catégories
export interface CategoryData {
  id?: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface Category extends CategoryData {
  id: number;
  created_at: string;
  updated_at: string;
  products_count?: number;
}

// Types pour les sous-catégories
export interface SubcategoryData {
  id?: number;
  name: string;
  description?: string;
  category_id: number;
  status: 'active' | 'inactive';
}

export interface Subcategory extends SubcategoryData {
  id: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  products_count?: number;
}

// Types pour les produits
export interface ProductData {
  id?: number;
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

export interface Product extends ProductData {
  id: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  subcategory?: Subcategory;
}

class AdminService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    return result;
  }

  // ==================== CATEGORIES ====================
  
  async getCategories(page = 1, perPage = 10): Promise<PaginatedResponse<Category>> {
    const response = await fetch(
      `${API_BASE_URL}/admin/categories?page=${page}&per_page=${perPage}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<PaginatedResponse<Category>>(response);
  }

  async getCategory(id: number): Promise<ApiResponse<Category>> {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<Category>>(response);
  }

  async createCategory(data: CategoryData): Promise<ApiResponse<Category>> {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<Category>>(response);
  }

  async updateCategory(id: number, data: CategoryData): Promise<ApiResponse<Category>> {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<Category>>(response);
  }

  async deleteCategory(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<null>>(response);
  }

  // ==================== SUBCATEGORIES ====================
  
  async getSubcategories(page = 1, perPage = 10, categoryId?: number): Promise<PaginatedResponse<Subcategory>> {
    let url = `${API_BASE_URL}/admin/subcategories?page=${page}&per_page=${perPage}`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<PaginatedResponse<Subcategory>>(response);
  }

  async getSubcategory(id: number): Promise<ApiResponse<Subcategory>> {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<Subcategory>>(response);
  }

  async createSubcategory(data: SubcategoryData): Promise<ApiResponse<Subcategory>> {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<Subcategory>>(response);
  }

  async updateSubcategory(id: number, data: SubcategoryData): Promise<ApiResponse<Subcategory>> {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<Subcategory>>(response);
  }

  async deleteSubcategory(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<null>>(response);
  }

  // ==================== PRODUCTS ====================
  
  async getProducts(page = 1, perPage = 10, filters?: {
    category_id?: number;
    subcategory_id?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Product>> {
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
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<PaginatedResponse<Product>>(response);
  }

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<Product>>(response);
  }

  async createProduct(data: ProductFormData): Promise<ApiResponse<Product>> {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<Product>>(response);
  }

  async updateProduct(id: number, data: ProductFormData): Promise<ApiResponse<Product>> {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<Product>>(response);
  }

  async deleteProduct(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<null>>(response);
  }

  // ==================== UPLOAD ====================
  
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    
    return this.handleResponse<ApiResponse<{ url: string }>>(response);
  }
}

export const adminService = new AdminService();
