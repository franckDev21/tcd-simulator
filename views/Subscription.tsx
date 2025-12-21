import React, { useState } from 'react';
import { Check, Smartphone, CreditCard, ShieldCheck, Crown, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';

type PaymentMethod = 'ORANGE' | 'MTN' | 'VISA';
type Plan = 'DAILY' | 'WEEKLY' | 'MONTHLY';

const PLANS = {
  daily: { name: 'Pass Journalier', price: 1000, duration: '24 heures', features: ['Accès complet 24h', 'Tous les modules'] },
  weekly: { name: 'Pass Hebdo', price: 2000, duration: '7 jours', features: ['Accès complet 7 jours', 'Tous les modules', 'Corrections IA'] },
  monthly: { name: 'Pass Mensuel', price: 5000, duration: '30 jours', features: ['Accès complet 30 jours', 'Tous les modules', 'Corrections IA illimitées', 'Mode hors-ligne'] },
};

export const Subscription: React.FC = () => {
  const { user, upgradeUser, setView } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('MONTHLY');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      upgradeUser();
      alert("Paiement réussi ! Bienvenue dans PRIMO Premium.");
    }, 2000);
  };

  // If user is already Premium, show current plan info
  if (user?.isPremium && user?.subscriptionPlan) {
    const currentPlan = PLANS[user.subscriptionPlan as keyof typeof PLANS];
    
    return (
      <div className="max-w-2xl mx-auto p-6 py-12 animate-fade-in">
        {/* Current Plan Card */}
        <GlassCard className="relative overflow-hidden">
          {/* Premium Badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-bl-xl text-sm font-bold flex items-center gap-1.5">
            <Crown size={14} /> Premium Actif
          </div>

          <div className="pt-8 pb-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Sparkles size={32} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentPlan?.name || 'Abonnement Premium'}</h2>
                <p className="text-slate-400 text-sm">Votre abonnement actuel</p>
              </div>
            </div>

            {/* Plan Details */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-glass-200 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Prix payé</div>
                <div className="text-xl font-bold">{currentPlan?.price?.toLocaleString() || '---'} FCFA</div>
              </div>
              <div className="bg-glass-200 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Durée</div>
                <div className="text-xl font-bold flex items-center gap-2">
                  <Calendar size={18} className="text-blue-400" />
                  {currentPlan?.duration || '---'}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-emerald-500/10 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <Check size={16} /> Vos avantages
              </h4>
              <ul className="space-y-2">
                {currentPlan?.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={14} className="text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => setView('ALL_PLANS')}
              >
                Changer de forfait
              </Button>
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={() => setView('DASHBOARD')}
              >
                Continuer à réviser <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Help Section */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Une question sur votre abonnement ?</p>
          <button className="text-blue-400 hover:underline mt-1">
            Contacter le support
          </button>
        </div>
      </div>
    );
  }

  // Non-premium user: show subscription options
  return (
    <div className="max-w-4xl mx-auto p-6 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Passez au niveau supérieur</h1>
        <p className="text-slate-500">Débloquez tout le potentiel du simulateur</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left: Plan Summary */}
        <div className="space-y-4">
           <GlassCard 
             className={`${selectedPlan === 'DAILY' ? 'ring-2 ring-blue-500' : ''} cursor-pointer transition-all hover:bg-glass-200`} 
             onClick={() => setSelectedPlan('DAILY')}
           >
              <div className="flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-lg">Pass Journalier</h3>
                   <p className="text-slate-400 text-sm">Pour une révision rapide</p>
                </div>
                <div className="text-right">
                   <div className="font-bold text-xl">1 000 FCFA</div>
                   <div className="text-xs text-slate-500">/ 24 heures</div>
                </div>
              </div>
           </GlassCard>

           <GlassCard 
             className={`${selectedPlan === 'WEEKLY' ? 'ring-2 ring-blue-500' : ''} cursor-pointer transition-all hover:bg-glass-200`} 
             onClick={() => setSelectedPlan('WEEKLY')}
           >
              <div className="flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-lg">Pass Hebdo</h3>
                   <p className="text-slate-400 text-sm">Idéal pour les révisions de dernière minute</p>
                </div>
                <div className="text-right">
                   <div className="font-bold text-xl">2 000 FCFA</div>
                   <div className="text-xs text-slate-500">/ 7 jours</div>
                </div>
              </div>
           </GlassCard>
           
           <GlassCard 
             className={`${selectedPlan === 'MONTHLY' ? 'ring-2 ring-blue-500' : ''} cursor-pointer transition-all hover:bg-glass-200 relative overflow-hidden`} 
             onClick={() => setSelectedPlan('MONTHLY')}
           >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-bl-lg text-xs font-bold">
                Recommandé
              </div>
              <div className="flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-lg">Pass Mensuel</h3>
                   <p className="text-slate-400 text-sm">Le choix recommandé pour progresser</p>
                </div>
                <div className="text-right">
                   <div className="font-bold text-xl">5 000 FCFA</div>
                   <div className="text-xs text-slate-500">/ 30 jours</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-glass-border">
                <ul className="text-sm space-y-2 text-slate-500">
                  <li className="flex gap-2"><Check size={16} className="text-green-500"/> Corrections illimitées</li>
                  <li className="flex gap-2"><Check size={16} className="text-green-500"/> Accès aux 4 modules</li>
                  <li className="flex gap-2"><Check size={16} className="text-green-500"/> Mode hors-connexion</li>
                </ul>
              </div>
           </GlassCard>

           <button 
             onClick={() => setView('ALL_PLANS')}
             className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2 transition-colors"
           >
             Voir toutes nos offres →
           </button>
        </div>

        {/* Right: Payment Flow */}
        <GlassCard>
           <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
             <CreditCard size={20} /> Paiement Sécurisé
           </h3>
           
           {/* Method Selection */}
           <div className="space-y-4 mb-6">
             <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setSelectedMethod('ORANGE')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedMethod === 'ORANGE' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-glass-100 border-glass-border hover:bg-glass-200'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">OM</div>
                  <span className="text-xs font-medium">Orange</span>
                </button>
                <button 
                  onClick={() => setSelectedMethod('MTN')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedMethod === 'MTN' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-glass-100 border-glass-border hover:bg-glass-200'}`}
                >
                   <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-xs">M</div>
                   <span className="text-xs font-medium">MTN</span>
                </button>
                <button 
                  onClick={() => setSelectedMethod('VISA')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedMethod === 'VISA' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-glass-100 border-glass-border hover:bg-glass-200'}`}
                >
                   <CreditCard size={18} />
                   <span className="text-xs font-medium">Carte</span>
                </button>
             </div>
           </div>

           {/* Input Fields */}
           {selectedMethod && (
             <div className="space-y-4 animate-fade-in">
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">
                   {selectedMethod === 'VISA' ? 'Numéro de carte' : 'Numéro de téléphone mobile'}
                 </label>
                 <div className="relative">
                   <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                   <input 
                    type="text" 
                    placeholder={selectedMethod === 'VISA' ? "0000 0000 0000 0000" : "6XX XX XX XX"}
                    className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 transition-all text-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                   />
                 </div>
               </div>
               
               <div className="bg-glass-100 p-3 rounded-lg flex items-start gap-3 text-xs text-slate-500">
                 <ShieldCheck size={16} className="text-green-500 shrink-0" />
                 Paiement crypté SSL 256-bits. Aucune donnée bancaire n'est stockée sur nos serveurs.
               </div>

               <Button 
                className="w-full mt-4" 
                onClick={handlePayment} 
                disabled={!phone}
                loading={loading}
               >
                 Payer {selectedPlan === 'DAILY' ? '1 000' : selectedPlan === 'WEEKLY' ? '2 000' : '5 000'} FCFA
               </Button>
             </div>
           )}
        </GlassCard>
      </div>
    </div>
  );
};