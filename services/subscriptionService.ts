import api from './api';

// =====================================================
// Types
// =====================================================

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  duration_label: string;
  features: string[];
  is_active: boolean;
  show_on_home: boolean;
  home_position: number | null;
  is_highlighted: boolean;
  highlight_label: string | null;
  badge_color: string | null;
  sort_order: number;
}

export interface UserSubscription {
  id: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  plan: {
    id: number;
    name: string;
    slug: string;
    features: string[];
  };
  starts_at: string;
  expires_at: string;
  remaining_days: number;
  auto_renew: boolean;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  is_premium: boolean;
  has_ai_correction?: boolean;
  subscription: UserSubscription | null;
}

export interface SubscriptionHistoryItem {
  id: number;
  plan_name: string;
  plan_price: number;
  status: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface TransactionHistoryItem {
  id: number;
  plan_name: string;
  amount: number;
  formatted_amount: string;
  payment_method: string;
  payment_method_label: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

// =====================================================
// Subscription Service
// =====================================================

export const subscriptionService = {
  /**
   * Get all active subscription plans (public).
   */
  async getPlans(homeOnly = false): Promise<SubscriptionPlan[]> {
    const response = await api.get<SubscriptionPlan[]>('/plans', {
      params: homeOnly ? { home_only: true } : {},
    });
    return response.data;
  },

  /**
   * Get plans for home page only.
   */
  async getHomePlans(): Promise<SubscriptionPlan[]> {
    return this.getPlans(true);
  },

  /**
   * Get a specific plan by slug.
   */
  async getPlanBySlug(slug: string): Promise<SubscriptionPlan> {
    const response = await api.get<SubscriptionPlan>(`/plans/${slug}`);
    return response.data;
  },

  /**
   * Get current user's subscription status.
   */
  async getMySubscription(): Promise<SubscriptionStatus> {
    const response = await api.get<SubscriptionStatus>('/user/subscription');
    return response.data;
  },

  /**
   * Get user's subscription history.
   */
  async getHistory(): Promise<SubscriptionHistoryItem[]> {
    const response = await api.get<SubscriptionHistoryItem[]>('/user/subscription/history');
    return response.data;
  },

  /**
   * Get user's payment transactions.
   */
  async getTransactions(): Promise<TransactionHistoryItem[]> {
    const response = await api.get<TransactionHistoryItem[]>('/user/subscription/transactions');
    return response.data;
  },

  /**
   * Toggle auto-renewal for current subscription.
   */
  async toggleAutoRenew(): Promise<{ auto_renew: boolean }> {
    const response = await api.post<{ auto_renew: boolean }>('/user/subscription/toggle-auto-renew');
    return response.data;
  },
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Format price for display.
 */
export const formatPrice = (price: number): string => {
  if (price === 0) return 'Gratuit';
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

/**
 * Get badge color class based on badge_color value.
 */
export const getBadgeColorClass = (badgeColor: string | null): string => {
  switch (badgeColor) {
    case 'gold':
      return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black';
    case 'blue':
      return 'bg-blue-500 text-white';
    case 'green':
      return 'bg-green-500 text-white';
    case 'purple':
      return 'bg-purple-500 text-white';
    default:
      return 'bg-slate-600 text-white';
  }
};

export default subscriptionService;
