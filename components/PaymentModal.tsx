import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Check, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button, GlassCard } from './GlassUI';
import { SubscriptionPlan, formatPrice } from '../services/subscriptionService';
import { paymentService, PaymentMethod, getPaymentMethodColor } from '../services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onSuccess?: () => void;
}

type PaymentStep = 'select_method' | 'phone_input' | 'processing' | 'redirecting' | 'success' | 'error';

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  const [step, setStep] = useState<PaymentStep>('select_method');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep('select_method');
    setSelectedMethod(null);
    setPhoneNumber('');
    setError(null);
    setPaymentUrl(null);
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Failed to load payment methods:', err);
      setError('Impossible de charger les modes de paiement');
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);

    if (method.requires_phone) {
      setStep('phone_input');
    } else {
      initiatePayment(method, undefined);
    }
  };

  const handlePhoneSubmit = () => {
    if (!selectedMethod) return;

    // Validate phone number (Cameroon format)
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!/^[0-9]{9}$/.test(cleanPhone)) {
      setError('Veuillez entrer un numéro de téléphone valide (9 chiffres)');
      return;
    }

    initiatePayment(selectedMethod, cleanPhone);
  };

  const initiatePayment = async (method: PaymentMethod, phone?: string) => {
    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      const result = await paymentService.initiatePayment({
        plan_id: plan.id,
        payment_method: method.id,
        phone_number: phone,
      });

      setPaymentUrl(result.payment_url);
      setStep('redirecting');

      // Redirect to payment page after a short delay
      setTimeout(() => {
        window.location.href = result.payment_url;
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'initialisation du paiement';
      setError(errorMessage);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    resetState();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <GlassCard className="w-full max-w-md relative animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-glass-200 transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-glass-text">Paiement</h2>
          <p className="text-sm text-slate-500 mt-1">
            {plan.name} - {formatPrice(plan.price)}
          </p>
        </div>

        {/* Content based on step */}
        {step === 'select_method' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-4">Choisissez votre mode de paiement :</p>

            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-glass-border bg-glass-100 hover:bg-glass-200 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${getPaymentMethodColor(method.id)} flex items-center justify-center`}>
                  {method.requires_phone ? (
                    <Smartphone size={24} className="text-white" />
                  ) : (
                    <CreditCard size={24} className="text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-glass-text group-hover:text-white transition-colors">
                    {method.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {method.requires_phone ? 'Paiement mobile' : 'Carte bancaire'}
                  </p>
                </div>
              </button>
            ))}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        )}

        {step === 'phone_input' && selectedMethod && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${getPaymentMethodColor(selectedMethod.id)} flex items-center justify-center`}>
                <Smartphone size={20} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-glass-text">{selectedMethod.name}</p>
                <p className="text-xs text-slate-500">Entrez votre numéro</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Numéro de téléphone
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-3 bg-glass-200 rounded-l-xl text-slate-400 border border-glass-border border-r-0">
                  +237
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
                    setPhoneNumber(value);
                    setError(null);
                  }}
                  placeholder="6XX XXX XXX"
                  className="flex-1 px-4 py-3 bg-glass-100 border border-glass-border rounded-r-xl text-glass-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Vous recevrez une demande de paiement sur ce numéro
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep('select_method')} className="flex-1">
                Retour
              </Button>
              <Button
                variant="primary"
                onClick={handlePhoneSubmit}
                disabled={phoneNumber.length !== 9}
                className="flex-1"
              >
                Payer {formatPrice(plan.price)}
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-glass-text font-medium">Initialisation du paiement...</p>
            <p className="text-sm text-slate-500 mt-2">Veuillez patienter</p>
          </div>
        )}

        {step === 'redirecting' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <ExternalLink size={32} className="text-blue-500" />
            </div>
            <p className="text-glass-text font-medium">Redirection vers le paiement...</p>
            <p className="text-sm text-slate-500 mt-2">
              Vous allez être redirigé vers la page de paiement sécurisée
            </p>
            {paymentUrl && (
              <a
                href={paymentUrl}
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mt-4 text-sm"
              >
                Cliquez ici si la redirection ne fonctionne pas
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-500" />
            </div>
            <p className="text-glass-text font-medium">Paiement réussi !</p>
            <p className="text-sm text-slate-500 mt-2">
              Votre abonnement {plan.name} est maintenant actif
            </p>
            <Button variant="primary" onClick={() => { onSuccess?.(); onClose(); }} className="mt-6">
              Continuer
            </Button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <p className="text-glass-text font-medium">Erreur de paiement</p>
            <p className="text-sm text-red-400 mt-2">{error}</p>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button variant="primary" onClick={handleRetry} className="flex-1">
                Réessayer
              </Button>
            </div>
          </div>
        )}

        {/* Security note */}
        {(step === 'select_method' || step === 'phone_input') && (
          <div className="mt-6 pt-4 border-t border-glass-border">
            <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Paiement sécurisé par CinetPay
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default PaymentModal;
