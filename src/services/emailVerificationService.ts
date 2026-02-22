import { apiClient } from './api';

export interface ResendVerificationRequest {
  email: string;
}

export const emailVerificationService = {
  async verifyEmail(token: string): Promise<void> {
    // Encode token to handle special characters in URL
    const encodedToken = encodeURIComponent(token);
    await apiClient.get(`/api/auth/verify-email?token=${encodedToken}`);
  },

  async resendVerification(data: ResendVerificationRequest): Promise<void> {
    await apiClient.post('/api/auth/resend-verification', data);
  },
};
