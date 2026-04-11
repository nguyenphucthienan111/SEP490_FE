// API base configuration
// In development, use empty string to use Vite proxy
// In production, use the actual API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:5000');

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for requests with a body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Phiên đăng nhập đã hết hạn');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  // Check if response has success field and it's false
  if (result && typeof result === 'object' && 'success' in result && result.success === false) {
    throw new Error(result.message || 'Request failed');
  }
  
  // For endpoints that return data: null but success: true, return void/undefined
  if (result && typeof result === 'object' && 'data' in result && result.data === null && result.success === true) {
    return undefined as T;
  }
  
  // If response has 'data' property, return it, otherwise return the whole response
  if (result && typeof result === 'object' && 'data' in result) {
    return result.data as T;
  }
  
  return result as T;
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },

  patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = localStorage.getItem('accessToken');
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { method: 'POST', headers, body: formData })
      .then(async res => {
        if (res.status === 401) { localStorage.removeItem('accessToken'); window.location.href = '/login'; throw new Error('Phiên đăng nhập đã hết hạn'); }
        if (!res.ok) { const err = await res.json().catch(() => ({ message: 'Error' })); throw new Error(err.message || `HTTP ${res.status}`); }
        const result = await res.json();
        if (result && typeof result === 'object' && 'data' in result) return result.data as T;
        return result as T;
      });
  },
};
