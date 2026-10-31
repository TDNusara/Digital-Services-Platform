const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem('taskpulse_token');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get('content-type') || '';
    let body: any = null;
    if (contentType.includes('application/json')) {
      try {
        body = await res.json();
      } catch {
        body = null;
      }
    } else {
      try {
        body = await res.text();
      } catch {
        body = null;
      }
    }

    if (!res.ok) {
      const errorMsg =
        (body && typeof body === 'object' && (body.error || body.message)) ||
        (typeof body === 'string' && body.length < 200 && body ? body : `Server responded with status ${res.status}`);
      throw new Error(errorMsg);
    }

    return (body || {}) as T;
  }

  async get<T = any>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(res);
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body || {}),
    });
    return this.handleResponse<T>(res);
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body || {}),
    });
    return this.handleResponse<T>(res);
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<T> {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body || {}),
    });
    return this.handleResponse<T>(res);
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(res);
  }

  getDownloadUrl(fileId: string): string {
    return `${API_BASE_URL}/files/download/${fileId}`;
  }
}

export const api = new ApiClient();
export default api;
