import { ProductFormData, AdminProduct, AdminCategory, AdminSubcategory, SubcategoryFormData, CategoryFormData, City, Neighborhood, PartnerData, Payment, DeliveryZone } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

// Fonction helper pour construire les URLs complètes des images
export const getFullImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) {
    return imagePath; // Déjà une URL complète
  }
  return `${BACKEND_URL}${imagePath}`;
};

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
    from?: number;
    to?: number;
  };
}

interface VendorData {
  id: number;
  name: string;
  email: string;
  shop_name: string;
  vendor_status: string;
}

interface VendorStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
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
  
  async getCategories(page = 1, perPage = 10): Promise<PaginatedResponse<AdminCategory>> {
    const response = await fetch(
      `${API_BASE_URL}/admin/categories?page=${page}&per_page=${perPage}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<PaginatedResponse<AdminCategory>>(response);
  }

  async getCategory(id: number): Promise<ApiResponse<AdminCategory>> {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<AdminCategory>>(response);
  }

  async createCategory(data: CategoryFormData): Promise<ApiResponse<AdminCategory>> {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<AdminCategory>>(response);
  }

  async updateCategory(id: number, data: CategoryFormData): Promise<ApiResponse<AdminCategory>> {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<AdminCategory>>(response);
  }

  async deleteCategory(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<null>>(response);
  }

  // ==================== SUBCATEGORIES ====================
  
  async getSubcategories(page = 1, perPage = 10, categoryId?: number): Promise<PaginatedResponse<AdminSubcategory>> {
    let url = `${API_BASE_URL}/admin/subcategories?page=${page}&per_page=${perPage}`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<PaginatedResponse<AdminSubcategory>>(response);
  }

  async getSubcategory(id: number): Promise<ApiResponse<AdminSubcategory>> {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<AdminSubcategory>>(response);
  }

  async createSubcategory(data: SubcategoryFormData): Promise<ApiResponse<AdminSubcategory>> {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<AdminSubcategory>>(response);
  }

  async updateSubcategory(id: number, data: SubcategoryFormData): Promise<ApiResponse<AdminSubcategory>> {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<AdminSubcategory>>(response);
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
  }): Promise<PaginatedResponse<AdminProduct>> {
    let url = `${API_BASE_URL}/admin/products?page=${page}&per_page=${perPage}`;
    
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
    
    return this.handleResponse<PaginatedResponse<AdminProduct>>(response);
  }

  async getProduct(id: number): Promise<ApiResponse<AdminProduct>> {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<AdminProduct>>(response);
  }

  async createProduct(data: ProductFormData): Promise<ApiResponse<AdminProduct>> {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<AdminProduct>>(response);
  }

  async updateProduct(id: number, data: ProductFormData): Promise<ApiResponse<AdminProduct>> {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<ApiResponse<AdminProduct>>(response);
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

  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const formData = new FormData();

    // Ajouter tous les fichiers au FormData
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    const result = await this.handleResponse<ApiResponse<{ urls: string[] }>>(response);
    return result.data.urls;
  }

  async deleteImage(path: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ path }),
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }

  // ==================== VENDORS ====================

  async getVendors(page = 1, perPage = 10, filters?: {
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<VendorData>> {
    let url = `${API_BASE_URL}/admin/vendors?page=${page}&per_page=${perPage}`;

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

    return this.handleResponse<PaginatedResponse<VendorData>>(response);
  }

  async getVendor(id: number): Promise<ApiResponse<VendorData>> {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<VendorData>>(response);
  }

  async approveVendor(id: number): Promise<ApiResponse<VendorData>> {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<VendorData>>(response);
  }

  async rejectVendor(id: number, reason: string): Promise<ApiResponse<VendorData>> {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });

    return this.handleResponse<ApiResponse<VendorData>>(response);
  }

  async suspendVendor(id: number, reason: string): Promise<ApiResponse<VendorData>> {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}/suspend`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });

    return this.handleResponse<ApiResponse<VendorData>>(response);
  }

  async reactivateVendor(id: number): Promise<ApiResponse<VendorData>> {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}/reactivate`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<VendorData>>(response);
  }

  async deleteVendor(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }

  async getVendorStatistics(): Promise<ApiResponse<VendorStatistics>> {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/statistics`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<VendorStatistics>>(response);
  }
  // ==================== CITIES ====================

  async getCities(page = 1, perPage = 15, filters?: { search?: string }): Promise<PaginatedResponse<City>> {
    let url = `${API_BASE_URL}/admin/cities?page=${page}&per_page=${perPage}`;
    if (filters?.search) url += `&search=${encodeURIComponent(filters.search)}`;
    const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<City>>(response);
  }

  async createCity(data: { name: string; code: string; country?: string; is_active?: boolean }): Promise<ApiResponse<City>> {
    const response = await fetch(`${API_BASE_URL}/admin/cities`, {
      method: 'POST', headers: this.getHeaders(), body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<City>>(response);
  }

  async updateCity(id: number, data: { name: string; code: string; country?: string; is_active?: boolean }): Promise<ApiResponse<City>> {
    const response = await fetch(`${API_BASE_URL}/admin/cities/${id}`, {
      method: 'PUT', headers: this.getHeaders(), body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<City>>(response);
  }

  async deleteCity(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/cities/${id}`, {
      method: 'DELETE', headers: this.getHeaders(),
    });
    return this.handleResponse<ApiResponse<null>>(response);
  }

  // ==================== NEIGHBORHOODS ====================

  async getNeighborhoods(page = 1, perPage = 15, cityId?: number): Promise<PaginatedResponse<Neighborhood>> {
    let url = `${API_BASE_URL}/admin/neighborhoods?page=${page}&per_page=${perPage}`;
    if (cityId) url += `&city_id=${cityId}`;
    const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<Neighborhood>>(response);
  }

  async createNeighborhood(data: { name: string; city_id: number; is_active?: boolean }): Promise<ApiResponse<Neighborhood>> {
    const response = await fetch(`${API_BASE_URL}/admin/neighborhoods`, {
      method: 'POST', headers: this.getHeaders(), body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<Neighborhood>>(response);
  }

  async updateNeighborhood(id: number, data: { name: string; city_id: number; is_active?: boolean }): Promise<ApiResponse<Neighborhood>> {
    const response = await fetch(`${API_BASE_URL}/admin/neighborhoods/${id}`, {
      method: 'PUT', headers: this.getHeaders(), body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<Neighborhood>>(response);
  }

  async deleteNeighborhood(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/neighborhoods/${id}`, {
      method: 'DELETE', headers: this.getHeaders(),
    });
    return this.handleResponse<ApiResponse<null>>(response);
  }

  // ==================== PARTNERS ====================

  async getPartners(page = 1, perPage = 15, filters?: { status?: string; search?: string }): Promise<PaginatedResponse<PartnerData>> {
    let url = `${API_BASE_URL}/admin/partners?page=${page}&per_page=${perPage}`;
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) url += `&${key}=${encodeURIComponent(value)}`;
      });
    }
    const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<PartnerData>>(response);
  }

  async approvePartner(id: number): Promise<ApiResponse<PartnerData>> {
    const response = await fetch(`${API_BASE_URL}/admin/partners/${id}/approve`, {
      method: 'POST', headers: this.getHeaders(),
    });
    return this.handleResponse<ApiResponse<PartnerData>>(response);
  }

  async rejectPartner(id: number, reason: string): Promise<ApiResponse<PartnerData>> {
    const response = await fetch(`${API_BASE_URL}/admin/partners/${id}/reject`, {
      method: 'POST', headers: this.getHeaders(), body: JSON.stringify({ reason }),
    });
    return this.handleResponse<ApiResponse<PartnerData>>(response);
  }

  async suspendPartner(id: number, reason: string): Promise<ApiResponse<PartnerData>> {
    const response = await fetch(`${API_BASE_URL}/admin/partners/${id}/suspend`, {
      method: 'POST', headers: this.getHeaders(), body: JSON.stringify({ reason }),
    });
    return this.handleResponse<ApiResponse<PartnerData>>(response);
  }

  async reactivatePartner(id: number): Promise<ApiResponse<PartnerData>> {
    const response = await fetch(`${API_BASE_URL}/admin/partners/${id}/reactivate`, {
      method: 'POST', headers: this.getHeaders(),
    });
    return this.handleResponse<ApiResponse<PartnerData>>(response);
  }

  async getPartnerStatistics(): Promise<ApiResponse<{ total: number; pending: number; approved: number; rejected: number; suspended: number }>> {
    const response = await fetch(`${API_BASE_URL}/admin/partners/statistics`, {
      method: 'GET', headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ==================== PAYMENTS ====================

  async getPayments(page = 1, perPage = 15, filters?: { status?: string }): Promise<PaginatedResponse<Payment>> {
    let url = `${API_BASE_URL}/admin/payments?page=${page}&per_page=${perPage}`;
    if (filters?.status) url += `&status=${encodeURIComponent(filters.status)}`;
    const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<Payment>>(response);
  }

  // ==================== DELIVERY ZONES ====================

  async getDeliveryZones(page = 1, perPage = 15, cityId?: number): Promise<PaginatedResponse<DeliveryZone>> {
    let url = `${API_BASE_URL}/admin/delivery-zones?page=${page}&per_page=${perPage}`;
    if (cityId) url += `&city_id=${cityId}`;
    const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<DeliveryZone>>(response);
  }

  async createDeliveryZone(data: Partial<DeliveryZone>): Promise<ApiResponse<DeliveryZone>> {
    const response = await fetch(`${API_BASE_URL}/admin/delivery-zones`, {
      method: 'POST', headers: this.getHeaders(), body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<DeliveryZone>>(response);
  }

  async updateDeliveryZone(id: number, data: Partial<DeliveryZone>): Promise<ApiResponse<DeliveryZone>> {
    const response = await fetch(`${API_BASE_URL}/admin/delivery-zones/${id}`, {
      method: 'PUT', headers: this.getHeaders(), body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<DeliveryZone>>(response);
  }

  async deleteDeliveryZone(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/delivery-zones/${id}`, {
      method: 'DELETE', headers: this.getHeaders(),
    });
    return this.handleResponse<ApiResponse<null>>(response);
  }
}

export const adminService = new AdminService();
