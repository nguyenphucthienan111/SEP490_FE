import { apiClient } from './api';

export interface UserResponse {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  roles?: string[];
  isEmailVerified?: boolean;
}

export const userService = {
  async getMe(): Promise<UserResponse> {
    return await apiClient.get<UserResponse>('/api/auth/me');
  },
};
