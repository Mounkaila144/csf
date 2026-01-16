import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    images?: string[];
  };
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  billing_address?: string;
  phone: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export interface CreateOrderData {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  shipping_address: string;
  billing_address?: string;
  phone: string;
  notes?: string;
}

class OrderService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      await authService.logout();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async getOrders(): Promise<Order[]> {
    const data = await this.makeRequest('/orders');
    return data.data || [];
  }

  async getOrder(id: number): Promise<Order> {
    const data = await this.makeRequest(`/orders/${id}`);
    return data.data;
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const data = await this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return data.data;
  }
}

export const orderService = new OrderService();
