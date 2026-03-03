// Java API Client for Oracle Database Backend
// Replaces Supabase with direct Java backend API calls

const API_BASE_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

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

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('javaApiToken');
  }

  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
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
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
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
