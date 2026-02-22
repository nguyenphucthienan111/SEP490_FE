import { apiClient } from './api';

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
}

export const userService = {
  async getMe(): Promise<UserResponse> {
    return await apiClient.get<UserResponse>('/api/auth/me');
  },
};
