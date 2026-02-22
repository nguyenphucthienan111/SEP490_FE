// API base configuration
// In development, use empty string to use Vite proxy
// In production, use the actual API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:5000');

// Debug: log API URL to console
console.log('API Base URL:', API_BASE_URL);

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });


  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    console.error('API Error:', error);
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
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
};
