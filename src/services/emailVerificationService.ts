import { apiClient } from './api';

export interface ResendVerificationRequest {
  email: string;
}

export const emailVerificationService = {
  async verifyEmail(token: string): Promise<void> {
    await apiClient.get(`/api/auth/verify-email?token=${token}`);
  },

  async resendVerification(data: ResendVerificationRequest): Promise<void> {
    await apiClient.post('/api/auth/resend-verification', data);
  },
};
