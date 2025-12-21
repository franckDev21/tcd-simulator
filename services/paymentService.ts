import api from './api';

// =====================================================
// Types
// =====================================================

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  requires_phone: boolean;
}

export interface InitiatePaymentRequest {
  plan_id: number;
  payment_method: string;
  phone_number?: string;
}

export interface InitiatePaymentResponse {
  message: string;
  payment_url: string;
  transaction_id: string;
}

export interface PaymentStatusResponse {
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
  is_success: boolean;
  is_pending: boolean;
  is_failed: boolean;
  subscription_id?: number;
}

// =====================================================
// Payment Service
// =====================================================

export const paymentService = {
  /**
   * Get available payment methods.
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get<{ methods: PaymentMethod[] }>('/payments/methods');
    return response.data.methods;
  },

  /**
   * Initiate a payment for a subscription plan.
   */
  async initiatePayment(data: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const response = await api.post<InitiatePaymentResponse>('/payments/initiate', data);
    return response.data;
  },

  /**
   * Check payment status.
   */
  async checkStatus(transactionId: string): Promise<PaymentStatusResponse> {
    const response = await api.get<PaymentStatusResponse>('/payments/status', {
      params: { transaction_id: transactionId },
    });
    return response.data;
  },
};

// =====================================================
// Payment Method Icons
// =====================================================

export const getPaymentMethodIcon = (iconId: string): string => {
  switch (iconId) {
    case 'orange-money':
      return '🟠';
    case 'mtn-momo':
      return '🟡';
    case 'visa':
      return '💳';
    case 'mastercard':
      return '💳';
    default:
      return '💰';
  }
};

export const getPaymentMethodColor = (methodId: string): string => {
  switch (methodId) {
    case 'orange_money':
      return 'bg-orange-500';
    case 'mtn_momo':
      return 'bg-yellow-500';
    case 'visa':
    case 'mastercard':
      return 'bg-blue-600';
    default:
      return 'bg-slate-500';
  }
};

export default paymentService;
