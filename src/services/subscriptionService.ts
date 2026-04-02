import { apiClient } from './api';

export interface SubscriptionStatus {
  status: 'Active' | 'Inactive' | string;
  isActive: boolean;
  planCode: string | null;
  planName: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  lastPaymentAt: string | null;
}

export interface PaymentInfo {
  paymentId: string;
  paymentCode: string;
  planCode: string;
  planName: string;
  amount: number;
  provider: string;
  status: 'Pending' | 'Paid' | 'Expired' | 'Cancelled' | string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrUrl: string;
  expiresAt: string;
  createdAt: string;
  paidAt: string | null;
  sePayTransactionId: string | null;
  sePayReferenceCode: string | null;
}

export const subscriptionService = {
  async getMySubscription(): Promise<SubscriptionStatus> {
    return await apiClient.get<SubscriptionStatus>('/api/subscriptions/me');
  },

  async createPayment(planCode: string): Promise<PaymentInfo> {
    return await apiClient.post<PaymentInfo>('/api/subscriptions/payments', { planCode });
  },

  async getPayment(paymentCode: string): Promise<PaymentInfo> {
    return await apiClient.get<PaymentInfo>(`/api/subscriptions/payments/${paymentCode}`);
  },
};
