import React, { useState } from 'react';
import { Check, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';

type PaymentMethod = 'ORANGE' | 'MTN' | 'VISA';
type Plan = 'WEEKLY' | 'MONTHLY';

export const Subscription: React.FC = () => {
  const { upgradeUser } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
      alert("Paiement réussi ! Bienvenue dans TCF Premium.");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Passez au niveau supérieur</h1>
        <p className="text-slate-500">Débloquez tout le potentiel du simulateur</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left: Plan Summary */}
        <div className="space-y-6">
           <GlassCard className={`${selectedPlan === 'WEEKLY' ? 'ring-2 ring-blue-500' : ''} cursor-pointer transition-all hover:bg-glass-200`} onClick={() => setSelectedPlan('WEEKLY')}>
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
           
           <GlassCard className={`${selectedPlan === 'MONTHLY' ? 'ring-2 ring-blue-500' : ''} cursor-pointer transition-all hover:bg-glass-200`} onClick={() => setSelectedPlan('MONTHLY')}>
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
                    className="w-full bg-glass-100 border border-glass-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 transition-all text-sm"
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
                 Payer {selectedPlan === 'WEEKLY' ? '2 000' : '5 000'} FCFA
               </Button>
             </div>
           )}
        </GlassCard>
      </div>
    </div>
  );
};