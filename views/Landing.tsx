import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Star, Zap, UserCheck, HelpCircle, Laptop, Clock, BarChart3, Smartphone, ChevronRight, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';
import { subscriptionService, SubscriptionPlan, formatPrice } from '../services/subscriptionService';
import { useAuthStore } from '../store/useAuthStore';
import { ROUTES } from '../router';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { toggleAuthModal } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Load home page plans on mount
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const homePlans = await subscriptionService.getHomePlans();
        setPlans(homePlans);
      } catch (error) {
        console.error('Failed to load plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };
    loadPlans();
  }, []);

  const handleStart = () => {
    toggleAuthModal(true);
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      // Free plan - just open auth modal
      toggleAuthModal(true);
      return;
    }
    
    if (!isAuthenticated) {
      // Store pending plan and show auth modal
      localStorage.setItem('pendingPlanId', plan.id.toString());
      toggleAuthModal(true);
      return;
    }
    
    // Authenticated user - go to checkout with selected plan
    navigate(ROUTES.CHECKOUT(plan.id));
  };

  const handleViewAllPlans = () => {
    navigate(ROUTES.PLANS);
  };

  return (
    <div className="flex flex-col w-full animate-fade-in overflow-hidden">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden min-h-[90vh]">
        {/* Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl w-full text-center z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass-100 border border-glass-border backdrop-blur-md text-sm text-blue-400 font-medium animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            PRIMO • La référence du TCF Canada
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-glass-text leading-tight">
            Le test de langue TCF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">réinventé pour l'excellence.</span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            La plateforme de référence pour s'entraîner au Test de Connaissance du Français. 
            Simulations réalistes, corrections par IA et suivi de progression détaillé.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button onClick={handleStart} className="w-full sm:w-auto h-14 text-lg shadow-xl shadow-blue-500/20 transform hover:scale-105 transition-transform">
              Commencer gratuitement <ArrowRight className="ml-2" />
            </Button>
            <Button variant="secondary" onClick={handleViewAllPlans} className="w-full sm:w-auto h-14 text-lg">
              Voir les tarifs
            </Button>
          </div>

          {/* Social Proof / Stats */}
          <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: "Utilisateurs", value: "10k+" },
              { label: "Simulations", value: "50k+" },
              { label: "Pays", value: "15+" },
              { label: "Réussite", value: "92%" },
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-glass-100 border border-glass-border backdrop-blur-sm">
                <div className="text-2xl font-bold text-glass-text">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- How it Works (Flow Layout) --- */}
      <div className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-glass-text mb-4">La route vers le C2</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Une méthode simple, efficace et éprouvée pour maximiser votre score.</p>
        </div>
        
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-500/10 via-indigo-500/20 to-blue-500/10 rounded-full transform -translate-y-1/2"></div>
          
          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {[
              { icon: UserCheck, title: "Inscription Rapide", step: "01", desc: "Créez votre compte en 30 secondes. Accès immédiat, sans carte bancaire." },
              { icon: Zap, title: "Simulation IA", step: "02", desc: "Passez des tests adaptatifs. Notre IA analyse vos forces et faiblesses." },
              { icon: TrendingUp, title: "Progression Ciblée", step: "03", desc: "Suivez le plan de révision généré pour atteindre le niveau C2." }
            ].map((step, idx) => (
              <div key={idx} className="group relative flex flex-col items-center text-center">
                {/* Number Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 text-9xl font-bold text-glass-text opacity-[0.03] select-none group-hover:opacity-[0.06] transition-opacity">
                  {step.step}
                </div>
                
                {/* Icon Bubble */}
                <div className="w-20 h-20 rounded-full bg-glass-bg border-4 border-glass-100 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-900/10 mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
                  <step.icon size={32} />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-glass-text">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Features (Bento Grid) --- */}
      <div className="py-24 px-6 bg-glass-100/20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-16 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-glass-text mb-6">Tout pour réussir le TCF</h2>
            <p className="text-slate-500 text-lg">Une suite d'outils complète conçue spécifiquement pour les exigences de l'immigration canadienne.</p>
          </div>
          
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[300px]">
            
            {/* Large Card: Stats */}
            <div className="md:col-span-8 p-8 rounded-3xl bg-gradient-to-br from-glass-100 to-glass-200 border border-glass-border relative overflow-hidden group hover:border-blue-500/30 transition-colors min-h-[300px]">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                    <BarChart3 size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-glass-text mb-2">Analytique Avancée</h3>
                  <p className="text-slate-400 max-w-md">Ne devinez plus votre niveau. Obtenez une estimation précise de votre score CLB/NCLC après chaque session.</p>
                </div>
                {/* Mock Chart UI */}
                <div className="mt-8 flex items-end gap-2 h-32 opacity-70 group-hover:opacity-100 transition-opacity">
                   <div className="w-1/6 bg-blue-500/20 h-[40%] rounded-t-lg"></div>
                   <div className="w-1/6 bg-blue-500/30 h-[60%] rounded-t-lg"></div>
                   <div className="w-1/6 bg-blue-500/40 h-[50%] rounded-t-lg"></div>
                   <div className="w-1/6 bg-blue-500/60 h-[80%] rounded-t-lg"></div>
                   <div className="w-1/6 bg-blue-500/80 h-[70%] rounded-t-lg"></div>
                   <div className="w-1/6 bg-blue-500 h-[95%] rounded-t-lg relative">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-blue-900 text-xs font-bold px-2 py-1 rounded">C2</div>
                   </div>
                </div>
              </div>
            </div>

            {/* Tall Card: Mobile */}
            <div className="md:col-span-4 md:row-span-2 p-8 rounded-3xl bg-glass-100 border border-glass-border relative overflow-hidden group min-h-[400px]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>
               <div className="h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                    <Smartphone size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-glass-text mb-4">100% Mobile Friendly</h3>
                  <p className="text-slate-400 mb-8">Révisez dans les transports, au café ou au lit. L'interface s'adapte parfaitement à votre écran.</p>
                  
                  {/* Phone Mockup - ADAPTIVE THEME */}
                  <div className="flex-1 rounded-t-3xl border-t-4 border-x-4 p-4 relative top-4 group-hover:top-0 transition-all duration-500 shadow-2xl 
                    bg-white border-slate-200 shadow-slate-200
                    dark:bg-black/40 dark:border-glass-border dark:shadow-none"
                  >
                     {/* Notch */}
                     <div className="w-1/3 h-1 rounded-full mx-auto mb-4 
                        bg-slate-300 dark:bg-white/20"
                     ></div>
                     
                     {/* Content Placeholders */}
                     <div className="space-y-3">
                        <div className="h-16 rounded-xl w-full 
                          bg-slate-100 dark:bg-white/5"
                        ></div>
                        <div className="h-16 rounded-xl w-full 
                          bg-slate-100 dark:bg-white/5"
                        ></div>
                        <div className="h-16 rounded-xl w-full 
                          bg-slate-100 dark:bg-white/5"
                        ></div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Medium Card: Timer */}
            <div className="md:col-span-4 p-8 rounded-3xl bg-glass-100 border border-glass-border hover:bg-glass-200 transition-colors min-h-[200px]">
               <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                      <Clock size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-glass-text mb-2">Mode Chrono</h3>
                    <p className="text-slate-400 text-sm">Entraînez-vous avec la pression réelle du temps.</p>
                  </div>
                  <div className="text-2xl font-mono text-amber-400 font-bold tracking-widest">
                    59:59
                  </div>
               </div>
            </div>

            {/* Medium Card: AI */}
            <div className="md:col-span-4 p-8 rounded-3xl bg-glass-100 border border-glass-border hover:bg-glass-200 transition-colors min-h-[200px]">
               <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <Laptop size={24} />
               </div>
               <h3 className="text-xl font-bold text-glass-text mb-2">Conditions d'Examen</h3>
               <p className="text-slate-400 text-sm">Interface identique à celle du jour J pour éliminer le stress.</p>
            </div>

          </div>
        </div>
      </div>

      {/* --- Testimonials (Staggered Layout) --- */}
      <div className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-glass-text mb-4">Ils ont réussi, pourquoi pas vous ?</h2>
            <div className="flex justify-center gap-1 text-amber-400 mb-2">
               <Star fill="currentColor" size={20} />
               <Star fill="currentColor" size={20} />
               <Star fill="currentColor" size={20} />
               <Star fill="currentColor" size={20} />
               <Star fill="currentColor" size={20} />
            </div>
            <p className="text-slate-500">Noté 4.9/5 par plus de 2000 candidats</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Review 1 */}
            <div className="group p-8 rounded-2xl bg-glass-100 border border-glass-border hover:border-blue-500/40 transition-all hover:-translate-y-1 duration-300">
               <div className="mb-6 relative">
                  <span className="text-6xl text-blue-500/20 font-serif absolute -top-4 -left-4">"</span>
                  <p className="text-slate-300 italic relative z-10">J'étais bloquée au niveau B2. Grâce aux corrections détaillées de l'IA sur l'expression écrite, j'ai compris mes erreurs et décroché mon C1 en 3 semaines !</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 p-[2px]">
                     <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">S</div>
                  </div>
                  <div>
                     <div className="font-bold text-glass-text">Sarah K.</div>
                     <div className="text-xs text-blue-400">Infirmière • Maroc</div>
                  </div>
               </div>
            </div>

            {/* Review 2 (Center - Popped Up) */}
            <div className="group p-8 rounded-2xl bg-gradient-to-b from-glass-200 to-glass-100 border border-glass-border shadow-2xl shadow-blue-900/20 md:-translate-y-6 hover:-translate-y-8 transition-all duration-300 relative">
               <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                 Coup de cœur
               </div>
               <div className="mb-6 relative">
                  <span className="text-6xl text-indigo-500/20 font-serif absolute -top-4 -left-4">"</span>
                  <p className="text-glass-text font-medium italic relative z-10 text-lg">L'interface est EXACTEMENT comme le jour de l'examen. Ça m'a permis de gérer mon stress. Le chronomètre ne me fait plus peur. C'est le meilleur investissement que j'ai fait.</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 p-[2px]">
                     <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">J</div>
                  </div>
                  <div>
                     <div className="font-bold text-glass-text">Jean-Marc D.</div>
                     <div className="text-xs text-blue-400">Ingénieur • Cameroun</div>
                  </div>
               </div>
            </div>

             {/* Review 3 */}
             <div className="group p-8 rounded-2xl bg-glass-100 border border-glass-border hover:border-blue-500/40 transition-all hover:-translate-y-1 duration-300">
               <div className="mb-6 relative">
                  <span className="text-6xl text-blue-500/20 font-serif absolute -top-4 -left-4">"</span>
                  <p className="text-slate-300 italic relative z-10">Le meilleur investissement pour ma préparation. C'est beaucoup moins cher qu'un prof particulier et on peut s'entraîner à 2h du matin quand les enfants dorment.</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-[2px]">
                     <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">A</div>
                  </div>
                  <div>
                     <div className="font-bold text-glass-text">Amélie L.</div>
                     <div className="text-xs text-blue-400">Étudiante • France</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-glass-text mb-4">Des tarifs adaptés à vos besoins</h2>
            <p className="text-slate-500 text-lg">Investissez dans votre avenir pour le prix d'un café par semaine.</p>
          </div>
          
          {/* Featured Cards - Dynamic from API */}
          {loadingPlans ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  title={plan.name}
                  price={formatPrice(plan.price)}
                  period={plan.duration_label}
                  features={plan.features}
                  isPopular={plan.is_highlighted}
                  highlightLabel={plan.highlight_label}
                  btnText={plan.price === 0 ? "Créer un compte" : "Choisir ce plan"}
                  onClick={() => handleSelectPlan(plan)}
                />
              ))}
            </div>
          )}

          {/* New Link to All Plans */}
          <div className="mt-12 text-center">
            <button 
              onClick={handleViewAllPlans}
              className="group inline-flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors px-6 py-3 rounded-full hover:bg-glass-100 border border-transparent hover:border-glass-border"
            >
              <span>Voir toutes nos offres d'abonnement adaptées à votre rythme</span>
              <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 px-6 max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-12 text-glass-text">Questions Fréquentes</h2>
        <div className="space-y-4">
          <FaqItem 
            question="Les sujets sont-ils conformes au TCF Canada ?"
            answer="Oui, tous nos sujets sont basés sur la structure officielle du TCF Canada (IRCC). Nous mettons à jour la banque de questions chaque mois."
          />
          <FaqItem 
            question="Comment fonctionne la correction par IA ?"
            answer="Notre IA analyse votre texte ou votre audio selon la grille d'évaluation officielle (grammaire, vocabulaire, cohérence). Elle vous donne une note et des conseils précis pour vous améliorer."
          />
          <FaqItem 
            question="Puis-je annuler mon abonnement ?"
            answer="Absolument. Les forfaits sont sans engagement. Vous pouvez annuler le renouvellement automatique à tout moment depuis votre profil."
          />
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden p-8 md:p-12 text-center bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-500/30 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-5xl font-bold text-white mb-6">Prêt à obtenir votre score C2 ?</h2>
            <p className="text-blue-100 text-base md:text-lg mb-8 max-w-2xl mx-auto">Rejoignez plus de 10 000 candidats qui ont réussi leur immigration grâce à PRIMO.</p>
            <Button onClick={handleStart} className="w-full md:w-auto bg-white text-blue-900 hover:bg-blue-50 border-none text-lg px-8 py-4 h-auto shadow-xl mx-auto">
              Commencer l'entraînement maintenant
            </Button>
            <p className="mt-4 text-sm text-blue-200/60">Aucune carte bancaire requise pour l'inscription.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

// --- Reusable Component Helpers (Pricing & FAQ) kept simple for cleanliness ---

const PricingCard = ({ title, price, period, features, isPopular, highlightLabel, btnText, onClick }: any) => (
  <div
    className={`
      relative p-8 rounded-2xl border transition-all duration-300 flex flex-col h-full
      ${isPopular
        ? 'bg-glass-200 border-blue-400 shadow-2xl shadow-blue-500/20 z-10 transform md:scale-105'
        : 'bg-glass-100 border-glass-border hover:border-glass-border/80'
      }
    `}
  >
    {isPopular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg border border-blue-400 flex items-center gap-1">
        <Zap size={12} fill="currentColor" /> {highlightLabel || 'Populaire'}
      </div>
    )}
    
    <div className="text-center mb-6 pt-2">
      <h3 className={`text-lg font-medium mb-2 ${isPopular ? 'text-blue-400' : 'text-slate-500'}`}>{title}</h3>
      <div className="flex items-baseline justify-center gap-1">
        <div className="text-4xl font-bold text-glass-text">{price}</div>
      </div>
      <div className="text-sm text-slate-400 mt-1">{period}</div>
    </div>
    
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-start gap-3 text-sm text-glass-text">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
             <Check size={12} className="text-green-500" />
          </div>
          <span className="text-slate-300">{f}</span>
        </li>
      ))}
    </ul>
    
    <Button 
      variant={isPopular ? 'primary' : 'secondary'} 
      className="w-full" 
      onClick={onClick}
    >
      {btnText}
    </Button>
  </div>
);

const FaqItem = ({ question, answer }: { question: string, answer: string }) => (
  <div className="bg-glass-100 border border-glass-border rounded-xl p-6 hover:bg-glass-200 transition-colors">
    <h3 className="flex items-start gap-3 text-lg font-semibold mb-2 text-glass-text">
      <HelpCircle size={20} className="text-blue-400 mt-1 shrink-0" />
      {question}
    </h3>
    <p className="text-slate-500 ml-8 leading-relaxed">
      {answer}
    </p>
  </div>
);
