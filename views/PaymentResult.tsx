import React, { useEffect, useState } from 'react';
import { Check, X, Clock, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { Button, GlassCard } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';
import { paymentService } from '../services/paymentService';

type ResultType = 'success' | 'error' | 'pending';

interface PaymentResultProps {
  type: ResultType;
}

export const PaymentResult: React.FC<PaymentResultProps> = ({ type }) => {
  const { setView } = useAppStore();
  const [checking, setChecking] = useState(type === 'pending');
  const [currentStatus, setCurrentStatus] = useState<ResultType>(type);

  // Get transaction ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('transaction_id');

  useEffect(() => {
    if (type === 'pending' && transactionId) {
      checkPaymentStatus();
    }
  }, [type, transactionId]);

  const checkPaymentStatus = async () => {
    if (!transactionId) return;

    setChecking(true);
    try {
      const status = await paymentService.checkStatus(transactionId);

      if (status.is_success) {
        setCurrentStatus('success');
      } else if (status.is_failed) {
        setCurrentStatus('error');
      }
      // If still pending, keep the current status
    } catch (error) {
      console.error('Failed to check payment status:', error);
    } finally {
      setChecking(false);
    }
  };

  const getContent = () => {
    switch (currentStatus) {
      case 'success':
        return {
          icon: Check,
          iconColor: 'text-green-500',
          iconBg: 'bg-green-500/20',
          title: 'Paiement réussi !',
          description: 'Votre abonnement est maintenant actif. Vous pouvez accéder à toutes les fonctionnalités premium.',
          primaryAction: {
            label: 'Accéder au tableau de bord',
            onClick: () => setView('DASHBOARD'),
          },
        };
      case 'error':
        return {
          icon: X,
          iconColor: 'text-red-500',
          iconBg: 'bg-red-500/20',
          title: 'Paiement échoué',
          description: 'Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer ou choisir un autre mode de paiement.',
          primaryAction: {
            label: 'Réessayer',
            onClick: () => setView('ALL_PLANS'),
          },
          secondaryAction: {
            label: 'Contacter le support',
            onClick: () => setView('CONTACT_SALES'),
          },
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          iconColor: 'text-amber-500',
          iconBg: 'bg-amber-500/20',
          title: 'Paiement en attente',
          description: 'Votre paiement est en cours de traitement. Cela peut prendre quelques minutes. Veuillez patienter ou vérifier votre téléphone pour confirmer le paiement.',
          primaryAction: {
            label: 'Vérifier le statut',
            onClick: checkPaymentStatus,
            loading: checking,
          },
          secondaryAction: {
            label: 'Retour aux plans',
            onClick: () => setView('ALL_PLANS'),
          },
        };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-md w-full text-center animate-fade-in">
        {/* Icon */}
        <div className={`w-20 h-20 rounded-full ${content.iconBg} flex items-center justify-center mx-auto mb-6`}>
          {checking ? (
            <Loader2 size={40} className="animate-spin text-blue-500" />
          ) : (
            <IconComponent size={40} className={content.iconColor} />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-glass-text mb-4">{content.title}</h1>

        {/* Description */}
        <p className="text-slate-500 mb-8">{content.description}</p>

        {/* Transaction ID */}
        {transactionId && (
          <div className="mb-6 p-3 bg-glass-200 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Référence de transaction</p>
            <p className="text-sm font-mono text-glass-text">{transactionId}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            onClick={content.primaryAction.onClick}
            loading={content.primaryAction.loading}
            className="w-full"
          >
            {content.primaryAction.loading ? (
              'Vérification...'
            ) : (
              <>
                {content.primaryAction.label}
                {currentStatus === 'pending' ? <RefreshCw size={18} /> : <ArrowRight size={18} />}
              </>
            )}
          </Button>

          {content.secondaryAction && (
            <Button
              variant="secondary"
              onClick={content.secondaryAction.onClick}
              className="w-full"
            >
              {content.secondaryAction.label}
            </Button>
          )}
        </div>

        {/* Auto-refresh notice for pending */}
        {currentStatus === 'pending' && (
          <p className="text-xs text-slate-500 mt-6">
            Cette page se rafraîchit automatiquement. Si le paiement est confirmé sur votre téléphone, cliquez sur "Vérifier le statut".
          </p>
        )}
      </GlassCard>
    </div>
  );
};

// Export specific result pages
export const PaymentSuccess: React.FC = () => <PaymentResult type="success" />;
export const PaymentError: React.FC = () => <PaymentResult type="error" />;
export const PaymentPending: React.FC = () => <PaymentResult type="pending" />;

export default PaymentResult;
