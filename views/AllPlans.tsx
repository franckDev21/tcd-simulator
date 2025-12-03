
import React from 'react';
import { ArrowLeft, Check, Zap, Crown, Clock, Calendar, Users } from 'lucide-react';
import { Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';

export const AllPlans: React.FC = () => {
  const { setView } = useAppStore();

  const handleSubscribe = (plan: string) => {
    // In a real app, you might pass the selected plan ID to the checkout flow
    setView('SUBSCRIPTION');
  };

  const PlanCard = ({ title, price, period, icon: Icon, features, type, color }: any) => {
    const isPremium = type === 'premium';
    const isValue = type === 'value';

    return (
      <div className={`
        relative overflow-hidden rounded-3xl p-8 border transition-all duration-300 group hover:-translate-y-2
        ${isPremium 
          ? 'bg-gradient-to-b from-white to-indigo-50 dark:from-slate-900 dark:to-black border-blue-500 shadow-2xl shadow-blue-500/20' 
          : 'bg-glass-100 border-glass-border hover:bg-glass-200'}
        ${isValue ? 'ring-2 ring-amber-400/50' : ''}
      `}>
        {isValue && (
          <div className="absolute top-4 right-4 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Meilleur choix
          </div>
        )}
        
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color} bg-opacity-20`}>
          <Icon size={28} className={color.replace('bg-', 'text-').replace('/20', '')} />
        </div>

        <h3 className={`text-xl font-bold mb-2 ${isPremium ? 'text-slate-900 dark:text-white' : 'text-glass-text'}`}>{title}</h3>
        
        <div className="flex items-baseline gap-1 mb-2">
          <span className={`text-3xl font-black ${isPremium ? 'text-blue-600 dark:text-blue-400' : 'text-glass-text'}`}>{price}</span>
          <span className="text-sm text-slate-500">{period}</span>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-500/20 to-transparent my-6"></div>

        <ul className="space-y-4 mb-8">
          {features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-sm">
               <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPremium ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-green-500/20 text-green-500'}`}>
                 <Check size={12} />
               </div>
               <span className={isPremium ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500'}>{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          variant={isPremium ? 'primary' : 'secondary'} 
          className="w-full"
          onClick={() => handleSubscribe(title)}
        >
          Choisir ce plan
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-16 relative">
        <Button variant="ghost" onClick={() => setView('LANDING')} className="absolute left-0 top-0 md:static">
          <ArrowLeft size={20} className="mr-2" /> Retour
        </Button>
        <div className="flex-1 text-center md:text-left mt-12 md:mt-0">
          <h1 className="text-4xl font-bold text-glass-text mb-2">Nos Formules d'Abonnement</h1>
          <p className="text-slate-500 text-lg">Choisissez la flexibilité qui vous convient pour réussir votre TCF Canada.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Short Term */}
        <PlanCard 
          title="Pass 24 Heures"
          price="500 FCFA"
          period="/ jour"
          icon={Clock}
          color="bg-slate-500/20"
          features={[
            "Accès complet pendant 24h",
            "Idéal pour un test blanc rapide",
            "Correction IA incluse"
          ]}
        />

        <PlanCard 
          title="Pass Week-end"
          price="1 000 FCFA"
          period="/ 48h"
          icon={Calendar}
          color="bg-orange-500/20"
          features={[
            "Valable du Vendredi au Dimanche",
            "Mode intensif débloqué",
            "Accès aux 50+ séries",
            "Support prioritaire"
          ]}
        />

        <PlanCard 
          title="Hebdomadaire"
          price="2 000 FCFA"
          period="/ semaine"
          icon={Zap}
          color="bg-blue-500/20"
          features={[
            "La formule la plus populaire",
            "Accès illimité 7 jours",
            "Statistiques de progression",
            "Correction Expression Orale & Écrite"
          ]}
        />

        <PlanCard 
          title="Mensuel"
          price="5 000 FCFA"
          period="/ mois"
          icon={Crown}
          color="bg-purple-500/20"
          type="value"
          features={[
            "Tout le pack Hebdo",
            "Économisez 60% par rapport à l'hebdo",
            "Badge certifié sur le profil",
            "Accès aux webinaires exclusifs"
          ]}
        />

        <PlanCard 
          title="Trimestriel"
          price="12 000 FCFA"
          period="/ 3 mois"
          icon={Users}
          color="bg-emerald-500/20"
          features={[
            "Idéal pour une préparation longue",
            "Accès complet pendant 90 jours",
            "Plan de révision personnalisé IA",
            "Garantie satisfaction"
          ]}
        />

        <PlanCard 
          title="Pack Excellence"
          price="25 000 FCFA"
          period="/ an"
          icon={Crown}
          type="premium"
          color="bg-indigo-500/20"
          features={[
            "L'expérience ultime",
            "Accès illimité pendant 1 an",
            "3 Corrections humaines par mois",
            "Coaching vidéo de 30min offert",
            "Accès anticipé aux nouvelles séries"
          ]}
        />

      </div>

      <div className="mt-16 text-center bg-glass-100 p-8 rounded-2xl border border-glass-border">
        <h3 className="text-xl font-bold mb-2">Besoin d'une offre pour votre école ou entreprise ?</h3>
        <p className="text-slate-500 mb-6">Nous proposons des tarifs de groupe et des tableaux de bord pour les enseignants.</p>
        <Button variant="secondary">Contacter l'équipe commerciale</Button>
      </div>
    </div>
  );
};
