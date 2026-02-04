import axios, { AxiosInstance, AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';
import type { ApiResponse, User, AuthResponse } from '@pos/types';

export class APIClient {
  private axios: AxiosInstance;
  private socket: Socket | null = null;
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.axios = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle responses
    this.axios.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth Endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.axios.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    if (response.data) {
      this.setToken(response.data.token);
      return response.data;
    }
    throw new Error('Login failed');
  }

  async register(payload: any): Promise<AuthResponse> {
    const response = await this.axios.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    if (response.data) {
      this.setToken(response.data.token);
      return response.data;
    }
    throw new Error('Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await this.axios.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.axios.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<string> {
    const response = await this.axios.post<ApiResponse<{ token: string }>>('/auth/refresh');
    if (response.data?.token) {
      this.setToken(response.data.token);
      return response.data.token;
    }
    throw new Error('Token refresh failed');
  }

  // Order Endpoints
  async createOrder(payload: any): Promise<any> {
    return this.axios.post('/orders', payload);
  }

  async getOrders(filters?: any): Promise<any> {
    return this.axios.get('/orders', { params: filters });
  }

  async getOrderById(id: string): Promise<any> {
    return this.axios.get(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string): Promise<any> {
    return this.axios.patch(`/orders/${id}/status`, { status });
  }

  async deleteOrder(id: string): Promise<void> {
    await this.axios.delete(`/orders/${id}`);
  }

  // Payment Endpoints
  async createPayment(payload: any): Promise<any> {
    return this.axios.post('/payments', payload);
  }

  async getPaymentById(id: string): Promise<any> {
    return this.axios.get(`/payments/${id}`);
  }

  // QR Code Endpoints
  async getQRCodes(): Promise<any> {
    return this.axios.get('/qr-codes');
  }

  async getQRCodeByTable(tableNumber: string): Promise<any> {
    return this.axios.get(`/qr-codes/table/${tableNumber}`);
  }

  // Menu Endpoints
  async getMenuItems(restaurantId: string): Promise<any> {
    return this.axios.get('/menu/items', { params: { restaurant_id: restaurantId } });
  }

  // Revenue Endpoints
  async getRevenueSummary(startDate: string, endDate: string): Promise<any> {
    return this.axios.get('/revenue/summary', { params: { start_date: startDate, end_date: endDate } });
  }

  async getDailyRevenue(date: string): Promise<any> {
    return this.axios.get(`/revenue/daily/${date}`);
  }

  // Settings Endpoints
  async getRestaurantSettings(): Promise<any> {
    return this.axios.get('/settings/restaurant');
  }

  async updateRestaurantSettings(payload: any): Promise<any> {
    return this.axios.patch('/settings/restaurant', payload);
  }

  // Socket.io Methods
  connectSocket(socketURL: string = this.baseURL.replace('/api', '')): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(socketURL, {
      auth: {
        token: this.token || undefined,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    return this.socket;
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onSocketEvent(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  offSocketEvent(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emitSocketEvent(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Auth Methods
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearAuth(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    this.disconnectSocket();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Singleton instance
let apiClientInstance: APIClient;

export function initAPIClient(baseURL?: string): APIClient {
  if (!apiClientInstance) {
    apiClientInstance = new APIClient(baseURL);
  }
  return apiClientInstance;
}

export function getAPIClient(): APIClient {
  if (!apiClientInstance) {
    apiClientInstance = new APIClient();
  }
  return apiClientInstance;
}

export default APIClient;
