const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface PartnerDashboardData {
  partner: {
    id: number;
    business_name: string;
    business_phone: string;
    business_address: string;
    status: string;
    commission_rate: number;
    city?: { id: number; name: string };
    neighborhood?: { id: number; name: string };
  };
  stats: {
    total_payments: number;
    total_commission: number;
    pending_codes: number;
    validated_codes: number;
  };
}

export interface PartnerOrder {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address: string;
  phone: string;
  created_at: string;
  user?: { id: number; name: string; email: string };
  order_items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: { id: number; name: string; images?: string[] };
  }>;
}

export interface PartnerPaymentCode {
  id: number;
  code: string;
  order_id: number;
  amount: number;
  status: string;
  expires_at: string;
  validated_at?: string;
  created_at: string;
  order?: { id: number; user?: { name: string } };
}

export interface PartnerPayment {
  id: number;
  order_id: number;
  amount: number;
  partner_commission: number;
  status: string;
  created_at: string;
  order?: { id: number; total_amount: number };
  client?: { id: number; name: string };
  payment_code?: { code: string };
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  status: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

class PartnerService {
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

  async getDashboard(): Promise<ApiResponse<PartnerDashboardData>> {
    const response = await fetch(`${API_BASE_URL}/partner/dashboard`, {
      method: 'GET', headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getOrders(page = 1, perPage = 15): Promise<PaginatedResponse<PartnerOrder>> {
    const response = await fetch(`${API_BASE_URL}/partner/orders?page=${page}&per_page=${perPage}`, {
      method: 'GET', headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async generatePaymentCode(orderId: number): Promise<ApiResponse<PartnerPaymentCode>> {
    const response = await fetch(`${API_BASE_URL}/partner/payment-codes/generate`, {
      method: 'POST', headers: this.getHeaders(),
      body: JSON.stringify({ order_id: orderId }),
    });
    return this.handleResponse(response);
  }

  async getPaymentCodes(page = 1, perPage = 15): Promise<PaginatedResponse<PartnerPaymentCode>> {
    const response = await fetch(`${API_BASE_URL}/partner/payment-codes?page=${page}&per_page=${perPage}`, {
      method: 'GET', headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getPayments(page = 1, perPage = 15): Promise<PaginatedResponse<PartnerPayment>> {
    const response = await fetch(`${API_BASE_URL}/partner/payments?page=${page}&per_page=${perPage}`, {
      method: 'GET', headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const partnerService = new PartnerService();
