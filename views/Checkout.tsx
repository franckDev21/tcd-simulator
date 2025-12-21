import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, AlertCircle, Smartphone, CreditCard, Lock, Shield, Sparkles } from 'lucide-react';
import { Button, GlassCard } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';
import { subscriptionService, SubscriptionPlan } from '../services/subscriptionService';
import { paymentService, PaymentMethod, getPaymentMethodColor } from '../services/paymentService';

type PaymentStep = 'input' | 'processing' | 'redirecting' | 'error';

// Mock Data for Fallback
const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 1,
    name: 'Pass Hebdo',
    slug: 'pass-hebdo',
    description: 'Idéal pour les révisions de dernière minute',
    price: 2000,
    currency: 'FCFA',
    duration_days: 7,
    duration_label: '7 jours',
    features: ['Accès complet', 'Simulations illimitées', 'Corrections IA'],
    is_active: true,
    show_on_home: true,
    home_position: 1,
    is_highlighted: false,
    highlight_label: null,
    badge_color: null,
    sort_order: 1
  },
  {
    id: 2,
    name: 'Pass Mensuel',
    slug: 'pass-mensuel',
    description: 'Le choix recommandé pour progresser',
    price: 5000,
    currency: 'FCFA',
    duration_days: 30,
    duration_label: '30 jours',
    features: ['Corrections illimitées', 'Accès aux 4 modules', 'Mode hors-connexion', 'Support prioritaire'],
    is_active: true,
    show_on_home: true,
    home_position: 2,
    is_highlighted: true,
    highlight_label: 'Populaire',
    badge_color: 'blue',
    sort_order: 2
  }
];

const MOCK_METHODS: PaymentMethod[] = [
  { id: 'orange_money', name: 'Orange Money', icon: 'orange-money', requires_phone: true },
  { id: 'mtn_momo', name: 'MTN Mobile Money', icon: 'mtn-momo', requires_phone: true },
  { id: 'card', name: 'Carte Bancaire', icon: 'visa', requires_phone: false }
];

export const Checkout: React.FC = () => {
  const { selectedPlanId, setView } = useAppStore();
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
  }, [selectedPlanId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [allPlans, methods] = await Promise.all([
        subscriptionService.getPlans().catch(() => null),
        paymentService.getPaymentMethods().catch(() => null),
      ]);
      
      let finalPlans = allPlans ? allPlans.filter(p => p.price > 0) : MOCK_PLANS;
      let finalMethods = methods || MOCK_METHODS;

      if (!finalPlans.length) finalPlans = MOCK_PLANS;
      if (!finalMethods.length) finalMethods = MOCK_METHODS;

      setPaymentMethods(finalMethods);

      // Find the selected plan
      if (selectedPlanId) {
        const plan = finalPlans.find(p => p.id === selectedPlanId);
        setSelectedPlan(plan || finalPlans[0]);
      } else {
        // Default to highlighted/popular plan
        const popular = finalPlans.find(p => p.is_highlighted);
        setSelectedPlan(popular || finalPlans[0]);
      }

      if (finalMethods.length > 0) {
        setSelectedMethod(finalMethods[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to load checkout data:', err);
      setSelectedPlan(MOCK_PLANS[1]);
      setPaymentMethods(MOCK_METHODS);
      setSelectedMethod(MOCK_METHODS[0]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !selectedMethod) return;

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

      setTimeout(() => {
        window.location.href = result.payment_url;
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'initialisation du paiement';
      setError(errorMessage);
      setStep('error');
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR').format(price);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // No plan selected - redirect back
  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Aucun plan sélectionné</h2>
          <p className="text-slate-400 mb-6">Veuillez d'abord choisir un plan d'abonnement.</p>
          <Button onClick={() => setView('ALL_PLANS')}>Voir les plans</Button>
        </GlassCard>
      </div>
    );
  }

  // Processing / Redirecting States
  if (step === 'processing' || step === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 'processing' ? 'Traitement en cours...' : 'Redirection vers CinetPay...'}
          </h2>
          <p className="text-slate-400 mb-4">
            {step === 'processing' 
              ? 'Veuillez patienter pendant que nous préparons votre paiement.'
              : 'Vous allez être redirigé vers la page de paiement sécurisée.'}
          </p>
          {paymentUrl && (
            <p className="text-xs text-slate-500">
              Si la redirection ne fonctionne pas, <a href={paymentUrl} className="text-blue-400 underline">cliquez ici</a>
            </p>
          )}
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => setView('ALL_PLANS')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Retour aux plans</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Finaliser votre abonnement
          </h1>
          <p className="text-slate-400">Paiement 100% sécurisé via CinetPay</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">
        
        {/* Left: Selected Plan Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-8">
            {/* Plan Card - Premium Design */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-2xl shadow-blue-900/30">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl -ml-16 -mb-16" />
              
              {/* Badge */}
              {selectedPlan.is_highlighted && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white">
                  <Sparkles size={12} />
                  {selectedPlan.highlight_label || 'Populaire'}
                </div>
              )}
              
              <div className="relative z-10">
                {/* Plan Name */}
                <h2 className="text-2xl font-bold text-white mb-2">{selectedPlan.name}</h2>
                <p className="text-blue-100/80 text-sm mb-6">{selectedPlan.description}</p>
                
                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{formatPrice(selectedPlan.price)}</span>
                    <span className="text-xl text-blue-100">FCFA</span>
                  </div>
                  <p className="text-blue-200/60 text-sm mt-1">/ {selectedPlan.duration_days} jours</p>
                </div>
                
                {/* Features */}
                {selectedPlan.features.length > 0 && (
                  <div className="border-t border-white/10 pt-6">
                    <p className="text-xs uppercase tracking-wider text-blue-200/60 mb-4">Inclus dans votre plan</p>
                    <ul className="space-y-3">
                      {selectedPlan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-white">
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <Check size={12} />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-3 text-slate-500 text-xs">
              <Shield size={16} />
              <span>Paiement crypté SSL 256-bits</span>
            </div>
          </div>
        </div>

        {/* Right: Payment Form */}
        <div className="lg:col-span-3">
          <GlassCard className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <CreditCard size={24} />
              Méthode de paiement
            </h3>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-3 mb-8">
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
                      p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-500/10 scale-105' 
                        : 'border-glass-border bg-glass-100 hover:border-slate-500 hover:bg-glass-200'
                      }
                    `}
                  >
                    <div className={`w-12 h-12 rounded-xl ${getPaymentMethodColor(method.id)} flex items-center justify-center`}>
                      {method.requires_phone ? (
                        <span className="text-white font-bold text-sm">
                          {method.id === 'orange_money' ? 'OM' : 'M'}
                        </span>
                      ) : (
                        <CreditCard size={20} className="text-white" />
                      )}
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                      {method.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Phone Input */}
            {selectedMethod?.requires_phone && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Numéro {selectedMethod.id === 'orange_money' ? 'Orange Money' : 'MTN'}
                </label>
                <div className="relative">
                  <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setPhoneNumber(value);
                      setError(null);
                    }}
                    placeholder="6XX XX XX XX"
                    className="w-full bg-glass-200 border border-glass-border rounded-xl pl-12 pr-4 py-4 text-lg font-mono text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Entrez les 9 chiffres de votre numéro (sans le 0)</p>
              </div>
            )}

            {/* Pay Button */}
            <Button
              onClick={handlePayment}
              disabled={!selectedMethod || (selectedMethod.requires_phone && phoneNumber.length !== 9)}
              className="w-full h-14 text-lg font-semibold"
            >
              <Lock size={18} className="mr-2" />
              Payer {formatPrice(selectedPlan.price)} FCFA
            </Button>

            {/* CinetPay Branding */}
            <div className="mt-8 pt-6 border-t border-glass-border">
              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                <Lock size={14} />
                <span>Paiement sécurisé par</span>
                <span className="font-bold text-slate-400">CinetPay</span>
              </div>
              <p className="text-center text-xs text-slate-600 mt-2">
                Aucune donnée bancaire n'est stockée sur nos serveurs
              </p>
            </div>
          </GlassCard>

          {/* Trust Badges */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Shield, label: 'Paiement sécurisé' },
              { icon: Lock, label: 'Données cryptées' },
              { icon: Check, label: 'Activation instantanée' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-slate-500">
                <item.icon size={20} />
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
