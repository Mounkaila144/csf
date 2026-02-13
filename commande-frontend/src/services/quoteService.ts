import { DeliveryZone, Quote } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface QuoteCalculation {
  items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    weight_kg: number;
    volume_m3: number;
  }>;
  subtotal_products: number;
  total_weight_kg: number;
  total_volume_m3: number;
  delivery_cost: number;
  total_amount: number;
  delivery_zone: DeliveryZone;
}

class QuoteService {
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

  async getDeliveryZones(): Promise<ApiResponse<DeliveryZone[]>> {
    const response = await fetch(`${API_BASE_URL}/delivery-zones`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return this.handleResponse(response);
  }

  async calculateQuote(deliveryZoneId: number, items: Array<{ product_id: number; quantity: number }>): Promise<ApiResponse<QuoteCalculation>> {
    const response = await fetch(`${API_BASE_URL}/quotes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_zone_id: deliveryZoneId, items }),
    });
    return this.handleResponse(response);
  }

  async createQuote(deliveryZoneId: number, items: Array<{ product_id: number; quantity: number }>, notes?: string): Promise<ApiResponse<Quote>> {
    const response = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ delivery_zone_id: deliveryZoneId, items, notes }),
    });
    return this.handleResponse(response);
  }
}

export const quoteService = new QuoteService();
