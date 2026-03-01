import { apiClient } from './api';

export interface ResendVerificationRequest {
  email: string;
}

export const emailVerificationService = {
  async verifyEmail(token: string): Promise<void> {
    // Backend expects GET request with token as query parameter
    // Fix: In URLs, '+' is decoded as space by searchParams.get()
    // But base64 tokens use '+' as a valid character, so we need to convert spaces back to '+'
    const fixedToken = token.replace(/ /g, '+');
    const encodedToken = encodeURIComponent(fixedToken);
    await apiClient.get(`/api/auth/verify-email?token=${encodedToken}`);
  },

  async resendVerification(data: ResendVerificationRequest): Promise<void> {
    await apiClient.post('/api/auth/resend-verification', data);
  },
};
