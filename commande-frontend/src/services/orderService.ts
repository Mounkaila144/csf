import { CartItem } from '../contexts/CartContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface OrderData {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  shipping_address: string;
  billing_address?: string;
  phone: string;
  notes?: string;
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
  order_items: Array<{
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      image?: string;
    };
  }>;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

class OrderService {
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

  async createOrder(orderData: OrderData): Promise<ApiResponse<Order>> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    });
    
    return this.handleResponse<ApiResponse<Order>>(response);
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<Order[]>>(response);
  }

  async getOrder(id: number): Promise<ApiResponse<Order>> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<Order>>(response);
  }

  async updateOrderStatus(id: number, status: Order['status']): Promise<ApiResponse<Order>> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    
    return this.handleResponse<ApiResponse<Order>>(response);
  }

  async deleteOrder(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ApiResponse<null>>(response);
  }

  // Utility function to convert cart items to order format
  cartItemsToOrderItems(cartItems: CartItem[]): OrderData['items'] {
    return cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
    }));
  }
}

export const orderService = new OrderService();