import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Calendar, Clock, Check, AlertTriangle, Loader2, History, CreditCard } from 'lucide-react';
import { Button, GlassCard } from '../components/GlassUI';
import { PaymentModal } from '../components/PaymentModal';
import {
  subscriptionService,
  SubscriptionStatus,
  SubscriptionPlan,
  SubscriptionHistoryItem,
  TransactionHistoryItem,
  formatPrice,
} from '../services/subscriptionService';
import { ROUTES } from '../router';

type TabType = 'current' | 'history' | 'transactions';

export const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [togglingAutoRenew, setTogglingAutoRenew] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subscriptionStatus, subscriptionHistory, paymentTransactions, availablePlans] = await Promise.all([
        subscriptionService.getMySubscription(),
        subscriptionService.getHistory(),
        subscriptionService.getTransactions(),
        subscriptionService.getPlans(),
      ]);
      setStatus(subscriptionStatus);
      setHistory(subscriptionHistory);
      setTransactions(paymentTransactions);
      setPlans(availablePlans);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    setTogglingAutoRenew(true);
    try {
      const result = await subscriptionService.toggleAutoRenew();
      if (status?.subscription) {
        setStatus({
          ...status,
          subscription: {
            ...status.subscription,
            auto_renew: result.auto_renew,
          },
        });
      }
    } catch (error) {
      console.error('Failed to toggle auto-renew:', error);
    } finally {
      setTogglingAutoRenew(false);
    }
  };

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    loadData(); // Reload subscription data
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Actif</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Expiré</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-slate-500/20 text-slate-400">Annulé</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400">En attente</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-slate-500/20 text-slate-400">{statusStr}</span>;
    }
  };

  const getTransactionStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'success':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Réussi</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Échoué</span>;
      case 'pending':
      case 'processing':
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400">En cours</span>;
      case 'refunded':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Remboursé</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-slate-500/20 text-slate-400">{statusStr}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate(ROUTES.DASHBOARD)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-glass-text">Mon Abonnement</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-glass-border pb-2">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'current'
              ? 'bg-glass-200 text-glass-text'
              : 'text-slate-500 hover:text-glass-text'
          }`}
        >
          <Crown size={18} className="inline mr-2" />
          Abonnement
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-glass-200 text-glass-text'
              : 'text-slate-500 hover:text-glass-text'
          }`}
        >
          <History size={18} className="inline mr-2" />
          Historique
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'transactions'
              ? 'bg-glass-200 text-glass-text'
              : 'text-slate-500 hover:text-glass-text'
          }`}
        >
          <CreditCard size={18} className="inline mr-2" />
          Paiements
        </button>
      </div>

      {/* Current Subscription Tab */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {status?.has_subscription && status.subscription ? (
            <GlassCard>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
                    <Crown size={28} className="text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-glass-text">{status.subscription.plan.name}</h2>
                    {getStatusBadge(status.subscription.status)}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-glass-200 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Calendar size={16} />
                    Date de début
                  </div>
                  <p className="text-glass-text font-medium">{formatDate(status.subscription.starts_at)}</p>
                </div>
                <div className="p-4 bg-glass-200 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Clock size={16} />
                    Expiration
                  </div>
                  <p className="text-glass-text font-medium">{formatDate(status.subscription.expires_at)}</p>
                  <p className="text-xs text-amber-400 mt-1">
                    {status.subscription.remaining_days > 0
                      ? `${status.subscription.remaining_days} jour(s) restant(s)`
                      : 'Expiré'}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Fonctionnalités incluses</h3>
                <ul className="space-y-2">
                  {status.subscription.plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-glass-text">
                      <Check size={16} className="text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Auto-renew toggle */}
              <div className="flex items-center justify-between p-4 bg-glass-200 rounded-xl">
                <div>
                  <p className="text-glass-text font-medium">Renouvellement automatique</p>
                  <p className="text-xs text-slate-500">
                    {status.subscription.auto_renew
                      ? 'Votre abonnement sera renouvelé automatiquement'
                      : 'Votre abonnement ne sera pas renouvelé'}
                  </p>
                </div>
                <button
                  onClick={handleToggleAutoRenew}
                  disabled={togglingAutoRenew}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    status.subscription.auto_renew ? 'bg-blue-500' : 'bg-slate-600'
                  }`}
                >
                  {togglingAutoRenew ? (
                    <Loader2 size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
                  ) : (
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        status.subscription.auto_renew ? 'left-7' : 'left-1'
                      }`}
                    />
                  )}
                </button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-glass-text mb-2">Aucun abonnement actif</h2>
              <p className="text-slate-500 mb-6">
                Souscrivez à un abonnement pour accéder à toutes les fonctionnalités premium.
              </p>
              <Button variant="primary" onClick={() => navigate(ROUTES.PLANS)}>
                Voir les plans
              </Button>
            </GlassCard>
          )}

          {/* Upgrade options */}
          {status?.has_subscription && plans.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-glass-text mb-4">Changer de plan</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {plans
                  .filter((p) => p.id !== status.subscription?.plan.id && p.price > 0)
                  .slice(0, 4)
                  .map((plan) => (
                    <div
                      key={plan.id}
                      className="p-4 bg-glass-100 border border-glass-border rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-glass-text">{plan.name}</p>
                        <p className="text-sm text-slate-500">{formatPrice(plan.price)}</p>
                      </div>
                      <Button variant="secondary" onClick={() => handleUpgrade(plan)}>
                        Choisir
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-slate-500">Aucun historique d'abonnement</p>
            </GlassCard>
          ) : (
            history.map((item) => (
              <GlassCard key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-glass-text">{item.plan_name}</p>
                  <p className="text-sm text-slate-500">
                    {formatDate(item.starts_at)} - {formatDate(item.expires_at)}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(item.status)}
                  <p className="text-sm text-slate-500 mt-1">{formatPrice(item.plan_price)}</p>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-slate-500">Aucune transaction</p>
            </GlassCard>
          ) : (
            transactions.map((tx) => (
              <GlassCard key={tx.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-glass-text">{tx.plan_name}</p>
                  <p className="text-sm text-slate-500">
                    {tx.payment_method_label} - {formatDate(tx.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  {getTransactionStatusBadge(tx.status)}
                  <p className="text-sm text-glass-text font-medium mt-1">{tx.formatted_amount}</p>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Subscription;
