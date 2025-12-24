import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Zap, Crown, Clock, Calendar, Users, Loader2 } from 'lucide-react';
import { Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { subscriptionService, SubscriptionPlan, formatPrice } from '../services/subscriptionService';
import { ROUTES } from '../router';

// Map duration_days to appropriate icon
const getIconForDuration = (days: number) => {
  if (days <= 1) return Clock;
  if (days <= 2) return Calendar;
  if (days <= 7) return Zap;
  if (days <= 30) return Crown;
  if (days <= 90) return Users;
  return Crown;
};

// Map badge_color to CSS class
const getColorClass = (badgeColor: string | null, isHighlighted: boolean): string => {
  switch (badgeColor) {
    case 'gold': return 'bg-amber-500/20';
    case 'blue': return 'bg-blue-500/20';
    case 'green': return 'bg-emerald-500/20';
    case 'purple': return 'bg-purple-500/20';
    default: return isHighlighted ? 'bg-indigo-500/20' : 'bg-slate-500/20';
  }
};

export const AllPlans: React.FC = () => {
  const navigate = useNavigate();
  const { toggleAuthModal } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const allPlans = await subscriptionService.getPlans();
        setPlans(allPlans);
      } catch (error) {
        console.error('Failed to load plans:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      // Store selected plan and open auth modal
      localStorage.setItem('pendingPlanId', plan.id.toString());
      toggleAuthModal(true);
      return;
    }

    // Redirect to checkout page with selected plan
    navigate(ROUTES.CHECKOUT(plan.id));
  };

  const PlanCard = ({ plan, delay }: { plan: SubscriptionPlan; delay: number }) => {
    const isPremium = plan.badge_color === 'gold' || plan.highlight_label === 'Premium';
    const isValue = plan.highlight_label === 'Meilleure valeur' || (plan.is_highlighted && !isPremium);
    const Icon = getIconForDuration(plan.duration_days);
    const colorClass = getColorClass(plan.badge_color, plan.is_highlighted);

    return (
      <div
        className={`
          relative overflow-hidden rounded-3xl p-8 border transition-all duration-300 group hover:-translate-y-2 animate-fade-in-up opacity-0
          ${isPremium
            ? 'bg-gradient-to-b from-white to-indigo-50 dark:from-slate-900 dark:to-black border-blue-500 shadow-2xl shadow-blue-500/20'
            : 'bg-glass-100 border-glass-border hover:bg-glass-200'}
          ${isValue ? 'ring-2 ring-amber-400/50' : ''}
        `}
        style={{ animationDelay: `${delay}ms` }}
      >
        {plan.is_highlighted && plan.highlight_label && (
          <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            isPremium ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black' :
            isValue ? 'bg-amber-400 text-black' :
            'bg-blue-500 text-white'
          }`}>
            {plan.highlight_label}
          </div>
        )}

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorClass}`}>
          <Icon size={28} className={colorClass.replace('bg-', 'text-').replace('/20', '')} />
        </div>

        <h3 className={`text-xl font-bold mb-2 ${isPremium ? 'text-slate-900 dark:text-white' : 'text-glass-text'}`}>
          {plan.name}
        </h3>

        <div className="flex items-baseline gap-1 mb-2">
          <span className={`text-3xl font-black ${isPremium ? 'text-blue-600 dark:text-blue-400' : 'text-glass-text'}`}>
            {formatPrice(plan.price)}
          </span>
          <span className="text-sm text-slate-500">{plan.duration_label}</span>
        </div>

        {plan.description && (
          <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
        )}

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-500/20 to-transparent my-6"></div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                isPremium ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-green-500/20 text-green-500'
              }`}>
                <Check size={12} />
              </div>
              <span className={isPremium ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500'}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <Button
          variant={isPremium ? 'primary' : 'secondary'}
          className="w-full"
          onClick={() => handleSubscribe(plan)}
        >
          {plan.price === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-16 relative">
        <Button variant="ghost" onClick={() => navigate(ROUTES.HOME)} className="absolute left-0 top-0 md:static">
          <ArrowLeft size={20} className="mr-2" /> Retour
        </Button>
        <div className="flex-1 text-center md:text-left mt-12 md:mt-0">
          <h1 className="text-4xl font-bold text-glass-text mb-2 animate-fade-in-up">Nos Formules d'Abonnement</h1>
          <p className="text-slate-500 text-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Choisissez la flexibilité qui vous convient pour réussir votre TCF Canada.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      ) : (
        <>
          {/* Grid of Plans */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <PlanCard key={plan.id} plan={plan} delay={200 + index * 100} />
            ))}
          </div>

          {/* Empty State */}
          {plans.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <p>Aucun plan disponible pour le moment.</p>
            </div>
          )}
        </>
      )}

      {/* Contact Sales CTA */}
      <div className="mt-16 text-center bg-glass-100 p-8 rounded-2xl border border-glass-border animate-fade-in-up" style={{ animationDelay: '800ms' }}>
        <h3 className="text-xl font-bold mb-2">Besoin d'une offre pour votre école ou entreprise ?</h3>
        <p className="text-slate-500 mb-6">Nous proposons des tarifs de groupe et des tableaux de bord pour les enseignants.</p>
        <Button variant="secondary" onClick={() => navigate(ROUTES.CONTACT)}>Contacter l'équipe commerciale</Button>
      </div>
    </div>
  );
};
