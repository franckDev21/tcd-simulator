import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, AlertCircle, Smartphone, CreditCard, ExternalLink, Lock, Zap, Crown } from 'lucide-react';
import { Button, GlassCard } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';
import { subscriptionService, SubscriptionPlan, formatPrice } from '../services/subscriptionService';
import { paymentService, PaymentMethod, getPaymentMethodColor } from '../services/paymentService';

type PaymentStep = 'input' | 'processing' | 'redirecting' | 'error';

export const Checkout: React.FC = () => {
  const { selectedPlanId, setView } = useAppStore();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<PaymentStep>('input');
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allPlans, methods] = await Promise.all([
        subscriptionService.getPlans(),
        paymentService.getPaymentMethods(),
      ]);
      
      // Filter to only show paid plans for checkout (exclude free)
      const paidPlans = allPlans.filter(p => p.price > 0);
      setPlans(paidPlans);
      setPaymentMethods(methods);

      // Select the plan from store if exists, otherwise first paid plan
      if (selectedPlanId) {
        const plan = paidPlans.find(p => p.id === selectedPlanId);
        if (plan) setSelectedPlan(plan);
        else if (paidPlans.length > 0) setSelectedPlan(paidPlans[0]);
      } else if (paidPlans.length > 0) {
        setSelectedPlan(paidPlans[0]);
      }

      // Pre-select first payment method
      if (methods.length > 0) {
        setSelectedMethod(methods[0]);
      }
    } catch (err) {
      console.error('Failed to load checkout data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !selectedMethod) return;

    // Validate phone if required
    if (selectedMethod.requires_phone) {
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      if (!/^[0-9]{9}$/.test(cleanPhone)) {
        setError('Veuillez entrer un numéro de téléphone valide (9 chiffres)');
        return;
      }
    }

    setStep('processing');
    setError(null);

    try {
      const result = await paymentService.initiatePayment({
        plan_id: selectedPlan.id,
        payment_method: selectedMethod.id,
        phone_number: selectedMethod.requires_phone ? phoneNumber.replace(/\s/g, '') : undefined,
      });

      setPaymentUrl(result.payment_url);
      setStep('redirecting');

      // Redirect to payment page
      setTimeout(() => {
        window.location.href = result.payment_url;
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'initialisation du paiement';
      setError(errorMessage);
      setStep('error');
    }
  };

  const getIconForPlan = (plan: SubscriptionPlan) => {
    if (plan.badge_color === 'gold' || plan.is_highlighted) return Crown;
    return Zap;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={64} className="animate-spin text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-glass-text mb-2">Initialisation du paiement...</h2>
          <p className="text-slate-500">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (step === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <ExternalLink size={40} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-glass-text mb-2">Redirection vers le paiement...</h2>
          <p className="text-slate-500 mb-6">Vous allez être redirigé vers la page de paiement sécurisée</p>
          {paymentUrl && (
            <a
              href={paymentUrl}
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              Cliquez ici si la redirection ne fonctionne pas
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="max-w-md w-full text-center py-12">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-glass-text mb-2">Erreur de paiement</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setView('ALL_PLANS')}>
              Annuler
            </Button>
            <Button variant="primary" onClick={() => setStep('input')}>
              Réessayer
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => setView('ALL_PLANS')}>
          <ArrowLeft size={20} />
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-glass-text mb-3">Passez au niveau supérieur</h1>
        <p className="text-slate-500 text-lg">Débloquez tout le potentiel du simulateur</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Plan Selection */}
        <div className="space-y-4">
          {plans.slice(0, 2).map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            
            // Format price: split number and currency
            const priceNumber = new Intl.NumberFormat('fr-FR').format(plan.price);
            
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`
                  relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
                  ${isSelected 
                    ? 'border-blue-500 bg-glass-100' 
                    : 'border-glass-border bg-glass-100/50 hover:bg-glass-100'
                  }
                `}
              >
                {/* Plan Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-slate-400">{plan.description || 'Accès complet au simulateur'}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="text-3xl font-bold text-white leading-none mb-1">{priceNumber}</div>
                    <div className="text-base font-bold text-white uppercase tracking-wider">FCFA</div>
                    <div className="text-xs text-slate-400 mt-1">/ {plan.duration_days} jours</div>
                  </div>
                </div>

                {/* Features - Only shown on selected plan */}
                {isSelected && plan.features.length > 0 && (
                  <>
                    <div className="h-px w-full bg-slate-500/20 my-5"></div>
                    <ul className="space-y-3">
                      {plan.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                          <Check size={16} className="text-green-400 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Payment Form */}
        <GlassCard className="h-fit">
          <h3 className="text-lg font-bold text-glass-text mb-6 flex items-center gap-2">
            <CreditCard size={20} />
            Paiement Sécurisé
          </h3>

          {/* Payment Methods */}
          <div className="flex gap-3 mb-6">
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod?.id === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedMethod(method);
                    setError(null);
                  }}
                  className={`
                    flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-glass-border hover:border-slate-500'
                    }
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl ${getPaymentMethodColor(method.id)} flex items-center justify-center`}>
                    {method.requires_phone ? (
                      <span className="text-white font-bold text-xs">
                        {method.id === 'orange_money' ? 'OM' : 'M'}
                      </span>
                    ) : (
                      <CreditCard size={20} className="text-white" />
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{method.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Phone Input (if required) */}
          {selectedMethod?.requires_phone && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Numéro de téléphone mobile
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-3 bg-glass-200 rounded-l-xl text-slate-400 border border-glass-border border-r-0">
                  🇨🇲
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
                    setPhoneNumber(value);
                    setError(null);
                  }}
                  placeholder="6XX XX XX XX"
                  className="flex-1 px-4 py-3 bg-glass-100 border border-glass-border rounded-r-xl text-glass-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Security Note */}
          <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300 flex items-start gap-2">
            <Lock size={16} className="shrink-0 mt-0.5" />
            Paiement crypté SSL 256-bits. Aucune donnée bancaire n'est stockée sur nos serveurs.
          </div>

          {/* Pay Button */}
          <Button 
            variant="primary" 
            className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={handlePayment}
            disabled={!selectedPlan || !selectedMethod || (selectedMethod.requires_phone && phoneNumber.length !== 9)}
          >
            Payer {selectedPlan ? formatPrice(selectedPlan.price) : ''}
          </Button>

          {/* CinetPay branding */}
          <p className="text-xs text-slate-500 text-center mt-4 flex items-center justify-center gap-2">
            <Lock size={12} />
            Paiement sécurisé par CinetPay
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Checkout;
