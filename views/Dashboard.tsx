import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mic, Headphones, Clock, Award, TrendingUp, Loader2, History, ChevronRight } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { ScoreHistoryChart } from '../components/Charts';
import { ModuleType } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { examService, UserExamHistory } from '../services/examService';
import { subscriptionService } from '../services/subscriptionService';
import { ROUTES } from '../router';

// Map ModuleType to URL-friendly code
const moduleToCode: Record<ModuleType, string> = {
  [ModuleType.READING]: 'CE',
  [ModuleType.LISTENING]: 'CO',
  [ModuleType.WRITING]: 'EE',
  [ModuleType.SPEAKING]: 'EO',
};

// Map module_type code to ModuleType enum
const moduleTypeMap: Record<string, ModuleType> = {
  'CE': ModuleType.READING,
  'CO': ModuleType.LISTENING,
  'EE': ModuleType.WRITING,
  'EO': ModuleType.SPEAKING,
};

const getModuleTypeFromCode = (code: string): ModuleType => {
  return moduleTypeMap[code] || ModuleType.READING;
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { activeModule, setActiveModule } = useAppStore();
  const { user } = useAuthStore();
  const [recentHistory, setRecentHistory] = useState<UserExamHistory[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  // Get user's first name with friendly greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.name?.split(' ')[0] || 'Candidat';

    if (hour < 12) return { text: `Bonjour, ${firstName}`, emoji: '👋' };
    if (hour < 18) return { text: `Bon après-midi, ${firstName}`, emoji: '☀️' };
    return { text: `Bonsoir, ${firstName}`, emoji: '🌙' };
  };

  const greeting = getGreeting();

  // Load recent history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoadingHistory(true);
        const history = await examService.getUserHistory(6);
        setRecentHistory(history);

        // Transform for chart (last 7 results for trend)
        const chartHistory = history.slice(0, 7).reverse().map((item) => ({
          name: new Date(item.completed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          score: item.score,
          module: getModuleTypeFromCode(item.module_type)
        }));
        setChartData(chartHistory);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  // Load subscription status
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const status = await subscriptionService.getMySubscription();
        setIsPremium(status.is_premium);
      } catch (error) {
        console.error('Failed to load subscription status:', error);
      }
    };

    loadSubscription();
  }, []);

  const handleModuleClick = (module: ModuleType) => {
    const moduleCode = moduleToCode[module];
    navigate(ROUTES.SERIES_SELECTION(moduleCode));
  };

  const handleViewAttempt = (attemptId: number) => {
    navigate(ROUTES.ATTEMPT_DETAIL(attemptId));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            {greeting.text} <span className="text-2xl">{greeting.emoji}</span>
          </h2>
          <p className="text-slate-400">Prêt pour votre prochaine simulation ?</p>
        </div>
        <div className="flex gap-2">
          {isPremium && (
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 animate-scale-in">
              <Award size={16} /> Premium
            </div>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp size={20} /> Performance Globale
              </h3>
              <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm text-slate-300 outline-none">
                <option>7 derniers jours</option>
                <option>Mois dernier</option>
              </select>
            </div>
            {chartData.length > 0 ? (
              <ScoreHistoryChart data={chartData} />
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500">
                <p>Aucune donnée disponible. Passez votre premier test !</p>
              </div>
            )}
          </GlassCard>

          {/* Module Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
              <ModuleCard
                title="Compréhension Écrite"
                icon={FileText}
                color="text-blue-400"
                bg="bg-blue-500/10"
                onClick={() => handleModuleClick(ModuleType.READING)}
              />
            </div>
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '150ms' }}>
              <ModuleCard
                title="Compréhension Orale"
                icon={Headphones}
                color="text-purple-400"
                bg="bg-purple-500/10"
                onClick={() => handleModuleClick(ModuleType.LISTENING)}
              />
            </div>
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
              <ModuleCard
                title="Expression Écrite"
                icon={EditIcon}
                color="text-emerald-400"
                bg="bg-emerald-500/10"
                onClick={() => handleModuleClick(ModuleType.WRITING)}
              />
            </div>
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '250ms' }}>
              <ModuleCard
                title="Expression Orale"
                icon={Mic}
                color="text-rose-400"
                bg="bg-rose-500/10"
                onClick={() => handleModuleClick(ModuleType.SPEAKING)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar / History */}
        <div className="space-y-6">
          <GlassCard className="h-full animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={18} /> Activité Récente
            </h3>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-500" size={24} />
              </div>
            ) : recentHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <History size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucun test effectué</p>
                <p className="text-xs mt-1">Commencez votre première simulation !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentHistory.map((item, idx) => {
                  const moduleType = getModuleTypeFromCode(item.module_type);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleViewAttempt(item.id)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer group animate-fade-in-up opacity-0 hover:scale-[1.02] transform duration-200"
                      style={{ animationDelay: `${400 + (idx * 100)}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getModuleColor(moduleType)}`}>
                          <span className="font-bold text-sm">{item.level}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{moduleType}</div>
                          <div className="text-[10px] text-blue-400/70 font-medium">{item.exam_title}</div>
                          <div className="text-xs text-slate-500">{formatDate(item.completed_at)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-bold">{item.score}</div>
                          <div className="text-xs text-slate-500">/ {item.max_score}</div>
                        </div>
                        <ChevronRight size={16} className="text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button
              variant="ghost"
              className="w-full mt-6 text-sm"
              onClick={() => navigate(ROUTES.HISTORY)}
            >
              Voir tout l'historique
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// Helpers
const EditIcon = (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;

const getModuleColor = (mod: ModuleType) => {
  switch(mod) {
    case ModuleType.READING: return 'bg-blue-500/20 text-blue-300';
    case ModuleType.LISTENING: return 'bg-purple-500/20 text-purple-300';
    case ModuleType.WRITING: return 'bg-emerald-500/20 text-emerald-300';
    case ModuleType.SPEAKING: return 'bg-rose-500/20 text-rose-300';
    default: return 'bg-slate-500/20';
  }
};

const ModuleCard = ({ title, icon: Icon, color, bg, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-glass-100 hover:bg-glass-200 border border-glass-border transition-all text-left group transform hover:-translate-y-1 duration-300 hover:shadow-lg">
    <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="font-semibold text-slate-200">{title}</div>
      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-white transition-colors">
        Commencer <ArrowIcon />
      </div>
    </div>
  </button>
);

const ArrowIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
