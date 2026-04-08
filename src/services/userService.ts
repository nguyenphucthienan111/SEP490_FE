import { apiClient } from './api';

export interface UserResponse {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles?: string[];
  isEmailVerified?: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5272' : '');

export const userService = {
  async getMe(): Promise<UserResponse> {
    return await apiClient.get<UserResponse>('/api/auth/me');
  },

  async updateProfile(data: { fullName?: string }): Promise<UserResponse> {
    return await apiClient.put<UserResponse>('/api/auth/profile', data);
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/auth/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Upload thất bại');
    }

    const json = await res.json();
    return json.data ?? json;
  },

  getAvatarUrl(avatarUrl?: string | null): string | null {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${API_BASE}${avatarUrl}`;
  },
};
