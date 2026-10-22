const API_BASE_URL = 'http://localhost:5000/api';

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

  async get<T = any>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Request failed');
    }
    return json;
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body || {}),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Request failed');
    }
    return json;
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body || {}),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Request failed');
    }
    return json;
  }

  getDownloadUrl(fileId: string): string {
    return `${API_BASE_URL}/files/download/${fileId}`;
  }
}

export const api = new ApiClient();
export default api;
