import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Award, Clock, Loader2, ChevronRight, FileText, Headphones, Mic } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';
import { examService, UserExamHistory } from '../services/examService';
import { ModuleType } from '../types';

// Map module_type code to ModuleType enum
const moduleTypeMap: Record<string, ModuleType> = {
  'CE': ModuleType.READING,
  'CO': ModuleType.LISTENING,
  'EE': ModuleType.WRITING,
  'EO': ModuleType.SPEAKING,
};

const getModuleIcon = (moduleType: string) => {
  switch (moduleType) {
    case 'CE': return FileText;
    case 'CO': return Headphones;
    case 'EE': return FileText;
    case 'EO': return Mic;
    default: return FileText;
  }
};

const getModuleColor = (moduleType: string) => {
  switch (moduleType) {
    case 'CE': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'CO': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'EE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'EO': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const getLevelColor = (level: string) => {
  if (level.startsWith('C')) return 'text-emerald-400';
  if (level.startsWith('B')) return 'text-blue-400';
  return 'text-amber-400';
};

export const HistoryPage: React.FC = () => {
  const { setView, viewAttemptDetail } = useAppStore();
  const [history, setHistory] = useState<UserExamHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await examService.getUserHistory(50); // Load more for full history
        setHistory(data);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeSpent = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => setView('DASHBOARD')}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Historique Complet</h1>
          <p className="text-slate-400 text-sm">Tous vos résultats de simulations</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : history.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Clock size={48} className="mx-auto mb-4 text-slate-500" />
          <h2 className="text-xl font-semibold mb-2">Aucun historique</h2>
          <p className="text-slate-400 mb-6">Vous n'avez pas encore passé de simulation.</p>
          <Button onClick={() => setView('DASHBOARD')}>
            Commencer une simulation
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {history.map((item, idx) => {
            const Icon = getModuleIcon(item.module_type);
            const moduleLabel = moduleTypeMap[item.module_type] || item.module_type;

            return (
              <GlassCard
                key={item.id}
                className="cursor-pointer hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg animate-fade-in-up opacity-0"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => viewAttemptDetail(item.id)}
              >
                <div className="flex items-center justify-between">
                  {/* Left Section */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${getModuleColor(item.module_type)}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{moduleLabel}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.exam_title}</div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(item.completed_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimeSpent(item.time_spent)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getLevelColor(item.level)}`}>
                        {item.level}
                      </div>
                      <div className="text-sm text-slate-400">
                        {item.score} / {item.max_score}
                      </div>
                      {item.correct_count !== undefined && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.correct_count}/{item.total_questions} correct
                        </div>
                      )}
                    </div>
                    <ChevronRight size={20} className="text-slate-500" />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
