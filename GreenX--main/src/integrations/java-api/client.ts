// Java API Client for Oracle Database Backend
// Replaces Supabase with direct Java backend API calls

import { API_BASE_URL } from '@/lib/backend';
const API_BASE_URL_TRIMMED = API_BASE_URL.replace(/\/+$/, '');

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface DatabaseRow {
  [key: string]: any;
}

class JavaApiClient {
  private baseUrl: string;
  private token: string | null = null;

  private normalizeKeys(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeKeys(item));
    }
    if (value && typeof value === 'object') {
      const out: Record<string, any> = {};
      Object.entries(value).forEach(([k, v]) => {
        out[k.toLowerCase()] = this.normalizeKeys(v);
      });
      return out;
    }
    return value;
  }

    constructor() {
    this.baseUrl = API_BASE_URL_TRIMMED;
  }

  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    // Always read fresh token from localStorage
    this.token = localStorage.getItem('javaApiToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      // 401/403: clear stale token and redirect to login
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('javaApiToken');
        localStorage.removeItem('greenx_token');
        window.location.href = '/login';
        return { success: false, error: 'Session expired — please log in again' };
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      let data: any;

      if (response.status === 204 || !contentType?.includes('application/json')) {
        // No content or non-JSON response
        if (!response.ok) {
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        data = {};
      } else {
        // Parse JSON response
        const text = await response.text();
        if (!text) {
          if (!response.ok) {
            return {
              success: false,
              error: `HTTP ${response.status}: Empty response`,
            };
          }
          data = {};
        } else {
          data = JSON.parse(text);
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      // Backend already returns ApiResponse format, so unwrap if needed
      if (data && typeof data === 'object' && 'success' in data) {
        const apiResp = data as ApiResponse<T>;
        return {
          ...apiResp,
          data: this.normalizeKeys(apiResp.data),
        } as ApiResponse<T>;
      }

      return {
        success: true,
        data: this.normalizeKeys(data),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  public async register(
    email: string,
    password: string,
    name: string,
    role: string,
    options?: { persistSession?: boolean }
  ) {
    const response = await this.request<AuthResponse>('/auth/register', 'POST', {
      email,
      password,
      name,
      role,
    });

    if (response.success && response.data && options?.persistSession !== false) {
      this.token = response.data.token;
      localStorage.setItem('javaApiToken', response.data.token);
    }

    return response;
  }

  public async signInWithPassword(email: string, password: string) {
    const response = await this.request<AuthResponse>('/auth/login', 'POST', {
      email,
      password,
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('javaApiToken', response.data.token);
    }

    return response;
  }

  public async signOut() {
    this.token = null;
    localStorage.removeItem('javaApiToken');
    return { success: true };
  }

  public async getCurrentUser() {
    return this.request('/auth/me', 'GET');
  }

  // Public escape hatch for non-CRUD API routes.
  public async call<T>(endpoint: string, method: string = 'GET', body?: any) {
    return this.request<T>(endpoint, method, body);
  }

  // Generic data operations for Oracle tables
  public async select(tableName: string, options?: any) {
    const queryParams = new URLSearchParams();
    if (options?.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        queryParams.append(`${key}`, String(value));
      });
    }
    if (options?.gte) {
      Object.entries(options.gte).forEach(([key, value]) => {
        queryParams.append(`${key}__gte`, String(value));
      });
    }
    if (options?.in) {
      Object.entries(options.in).forEach(([key, value]) => {
        const inValues = Array.isArray(value) ? value.join(',') : String(value);
        queryParams.append(`${key}__in`, inValues);
      });
    }
    if (options?.order) {
      queryParams.append('order', options.order.field);
      queryParams.append('sort', options.order.ascending ? 'asc' : 'desc');
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<DatabaseRow[]>(`/data/${tableName}${query}`, 'GET');
  }

  public async insert(tableName: string, data: any) {
    return this.request(`/data/${tableName}`, 'POST', data);
  }

  public async update(tableName: string, id: string, data: any) {
    return this.request(`/data/${tableName}/${id}`, 'PUT', data);
  }

  public async delete(tableName: string, id: string) {
    return this.request(`/data/${tableName}/${id}`, 'DELETE');
  }

  // Shorthand methods for common operations
  public from(tableName: string) {
    return {
      select: (fields?: string) => ({
        eq: (field: string, value: any) => ({
          data: null,
          error: null,
          then: (cb: any) =>
            this.select(tableName, { eq: { [field]: value } }).then(cb),
        }),
        gte: (field: string, value: any) => ({
          data: null,
          error: null,
          then: (cb: any) =>
            this.select(tableName, { gte: { [field]: value } }).then(cb),
        }),
        in: (field: string, values: any[]) =>
          this.select(tableName, { in: { [field]: values } }),
        order: (field: string, options: any) =>
          this.select(tableName, {
            order: { field, ascending: options?.ascending ?? true },
          }),
      }),
      insert: (data: any) => this.insert(tableName, data),
      update: (data: any) => ({
        eq: (field: string, value: any) =>
          this.update(tableName, value, data),
      }),
    };
  }

  // Auth property for compatibility
  public auth = {
    signInWithPassword: this.signInWithPassword.bind(this),
    signOut: this.signOut.bind(this),
    currentUser: this.getCurrentUser.bind(this),
  };
}

export const javaApi = new JavaApiClient();
