import { apiClient } from './api';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const passwordService = {
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    // Don't encode token - it's already encoded in URL
    await apiClient.post('/api/auth/reset-password', data);
  },
};
