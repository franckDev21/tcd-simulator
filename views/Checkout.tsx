import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, AlertCircle, Smartphone, CreditCard, Lock, Shield, Sparkles, ChevronDown, Calendar } from 'lucide-react';
import { Button, GlassCard } from '../components/GlassUI';
import { subscriptionService, SubscriptionPlan } from '../services/subscriptionService';
import { paymentService, PaymentMethod, getPaymentMethodColor } from '../services/paymentService';
import { ROUTES } from '../router';

type PaymentStep = 'input' | 'processing' | 'redirecting' | 'error';

// Country codes for Africa
const COUNTRY_CODES = [
  { code: '+237', country: 'CM', flag: '🇨🇲', name: 'Cameroun' },
  { code: '+225', country: 'CI', flag: '🇨🇮', name: 'Côte d\'Ivoire' },
  { code: '+221', country: 'SN', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+223', country: 'ML', flag: '🇲🇱', name: 'Mali' },
  { code: '+226', country: 'BF', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+228', country: 'TG', flag: '🇹🇬', name: 'Togo' },
  { code: '+229', country: 'BJ', flag: '🇧🇯', name: 'Bénin' },
  { code: '+241', country: 'GA', flag: '🇬🇦', name: 'Gabon' },
  { code: '+242', country: 'CG', flag: '🇨🇬', name: 'Congo' },
  { code: '+243', country: 'CD', flag: '🇨🇩', name: 'RD Congo' },
];

// Mock Data for Fallback
const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 1, name: 'Pass Hebdo', slug: 'pass-hebdo',
    description: 'Idéal pour les révisions de dernière minute',
    price: 2000, currency: 'FCFA', duration_days: 7, duration_label: '7 jours',
    features: ['Accès complet', 'Simulations illimitées', 'Corrections IA'],
    is_active: true, show_on_home: true, home_position: 1,
    is_highlighted: false, highlight_label: null, badge_color: null, sort_order: 1
  },
  {
    id: 2, name: 'Pass Mensuel', slug: 'pass-mensuel',
    description: 'Le choix recommandé pour progresser',
    price: 5000, currency: 'FCFA', duration_days: 30, duration_label: '30 jours',
    features: ['Corrections illimitées', 'Accès aux 4 modules', 'Mode hors-connexion'],
    is_active: true, show_on_home: true, home_position: 2,
    is_highlighted: true, highlight_label: 'Populaire', badge_color: 'blue', sort_order: 2
  }
];

const MOCK_METHODS: PaymentMethod[] = [
  { id: 'orange_money', name: 'Orange', icon: 'orange-money', requires_phone: true },
  { id: 'mtn_momo', name: 'MTN', icon: 'mtn-momo', requires_phone: true },
  { id: 'card', name: 'Carte', icon: 'visa', requires_phone: false }
];

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const selectedPlanId = planId ? parseInt(planId, 10) : null;
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  
  // Phone fields
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
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
      
      if (selectedPlanId) {
        const plan = finalPlans.find(p => p.id === selectedPlanId);
        setSelectedPlan(plan || finalPlans[0]);
      } else {
        const popular = finalPlans.find(p => p.is_highlighted);
        setSelectedPlan(popular || finalPlans[0]);
      }

      if (finalMethods.length > 0) setSelectedMethod(finalMethods[0]);
      setError(null);
    } catch {
      setSelectedPlan(MOCK_PLANS[1]);
      setPaymentMethods(MOCK_METHODS);
      setSelectedMethod(MOCK_METHODS[0]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !selectedMethod) return;

    // Validate based on payment method
    if (selectedMethod.requires_phone) {
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      if (!/^[0-9]{9}$/.test(cleanPhone)) {
        setError('Numéro de téléphone invalide (9 chiffres requis)');
        return;
      }
    } else {
      // Card validation
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Numéro de carte invalide');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setError('Date d\'expiration invalide (MM/AA)');
        return;
      }
      if (cardCvv.length < 3) {
        setError('CVV invalide');
        return;
      }
    }

    setStep('processing');
    setError(null);

    try {
      const result = await paymentService.initiatePayment({
        plan_id: selectedPlan.id,
        payment_method: selectedMethod.id,
        phone_number: selectedMethod.requires_phone ? `${selectedCountry.code}${phoneNumber}` : undefined,
      });

      setPaymentUrl(result.payment_url);
      setStep('redirecting');
      setTimeout(() => { window.location.href = result.payment_url; }, 2000);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors du paiement';
      setError(errorMessage);
      setStep('error');
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR').format(price);

  const isPayButtonDisabled = () => {
    if (!selectedMethod) return true;
    if (selectedMethod.requires_phone) return phoneNumber.length !== 9;
    return cardNumber.replace(/\s/g, '').length < 16 || cardExpiry.length < 5 || cardCvv.length < 3;
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // No plan
  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center max-w-sm p-6">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Aucun plan sélectionné</h2>
          <Button onClick={() => navigate(ROUTES.PLANS)} className="mt-4">Voir les plans</Button>
        </GlassCard>
      </div>
    );
  }

  // Processing
  if (step === 'processing' || step === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center max-w-sm p-6">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">
            {step === 'processing' ? 'Traitement...' : 'Redirection...'}
          </h2>
          <p className="text-sm text-slate-400">Veuillez patienter</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={() => navigate(ROUTES.PLANS)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4"
        >
          <ArrowLeft size={16} />
          <span>Retour</span>
        </button>
        <h1 className="text-2xl font-bold text-white text-center">Finaliser l'abonnement</h1>
      </div>

      {/* Main Content - Compact Grid */}
      <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-6">
        
        {/* Left: Plan Summary - Compact */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
          
          {selectedPlan.is_highlighted && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white">
              <Sparkles size={10} />
              {selectedPlan.highlight_label || 'Populaire'}
            </div>
          )}
          
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-1">{selectedPlan.name}</h2>
            <p className="text-blue-100/80 text-xs mb-4">{selectedPlan.description}</p>
            
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black text-white">{formatPrice(selectedPlan.price)}</span>
              <span className="text-sm text-blue-100">FCFA</span>
              <span className="text-xs text-blue-200/60 ml-1">/ {selectedPlan.duration_days}j</span>
            </div>
            
            {selectedPlan.features.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <ul className="space-y-2">
                  {selectedPlan.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white text-xs">
                      <Check size={12} className="text-green-300" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Payment Form - Compact */}
        <GlassCard className="p-5">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard size={18} />
            Paiement
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Payment Methods - Compact */}
          <div className="flex gap-2 mb-5">
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod?.id === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => { setSelectedMethod(method); setError(null); }}
                  className={`
                    flex-1 p-3 rounded-lg border transition-all flex flex-col items-center gap-2
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-glass-border bg-glass-100 hover:bg-glass-200'
                    }
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg ${getPaymentMethodColor(method.id)} flex items-center justify-center`}>
                    {method.requires_phone ? (
                      <span className="text-white font-bold text-[10px]">
                        {method.id === 'orange_money' ? 'OM' : 'M'}
                      </span>
                    ) : (
                      <CreditCard size={14} className="text-white" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                    {method.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Phone Input with Country Selector */}
          {selectedMethod?.requires_phone && (
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Numéro {selectedMethod.id === 'orange_money' ? 'Orange Money' : 'MTN MoMo'}
              </label>
              <div className="flex gap-2">
                {/* Country Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-1 bg-glass-200 border border-glass-border rounded-lg px-3 py-2.5 text-sm text-white hover:bg-glass-300 transition-colors"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="text-xs text-slate-400">{selectedCountry.code}</span>
                    <ChevronDown size={12} className="text-slate-500" />
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-glass-200 border border-glass-border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-glass-300 transition-colors text-left"
                        >
                          <span>{c.flag}</span>
                          <span className="flex-1">{c.name}</span>
                          <span className="text-xs text-slate-400">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Phone Number */}
                <div className="flex-1 relative">
                  <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9));
                      setError(null);
                    }}
                    placeholder="6XX XXX XXX"
                    className="w-full bg-glass-200 border border-glass-border rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Card Fields */}
          {selectedMethod && !selectedMethod.requires_phone && (
            <div className="space-y-3 mb-5">
              {/* Card Number */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Numéro de carte</label>
                <div className="relative">
                  <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full bg-glass-200 border border-glass-border rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nom sur la carte</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="JEAN DUPONT"
                  className="w-full bg-glass-200 border border-glass-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500 uppercase"
                />
              </div>
              
              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Expiration</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/AA"
                      className="w-full bg-glass-200 border border-glass-border rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">CVV</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full bg-glass-200 border border-glass-border rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            disabled={isPayButtonDisabled()}
            className="w-full h-11 text-sm font-semibold"
          >
            <Lock size={14} className="mr-2" />
            Payer {formatPrice(selectedPlan.price)} FCFA
          </Button>

          {/* Security Footer */}
          <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-[10px]">
            <Shield size={12} />
            <span>Paiement sécurisé par CinetPay</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
