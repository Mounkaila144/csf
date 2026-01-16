const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'vendor';
  vendor_status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  shop_name?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'admin' | 'client' | 'vendor';
  shop_name?: string;
  shop_description?: string;
  phone?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  getToken(): string | null {
    if (!this.isClient()) return null;
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    if (!this.isClient()) return;
    localStorage.setItem('auth_token', token);
  }

  private removeToken(): void {
    if (!this.isClient()) return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  private setUser(user: User): void {
    if (!this.isClient()) return;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    if (!this.isClient()) return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    if (!this.isClient()) return false;
    return this.getToken() !== null;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // Utiliser le bon endpoint en fonction du rôle
    const endpoint = data.role === 'vendor'
      ? `${API_BASE_URL}/auth/register/vendor`
      : `${API_BASE_URL}/auth/register`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    this.setToken(result.token);
    this.setUser(result.user);

    return result;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    this.setToken(result.token);
    this.setUser(result.user);

    return result;
  }

  async logout(): Promise<void> {
    const token = this.getToken();
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    this.removeToken();
  }

  async getProfile(): Promise<User> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get profile');
    }

    this.setUser(result.user);
    return result.user;
  }
}

export const authService = new AuthService();