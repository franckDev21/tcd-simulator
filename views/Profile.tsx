import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Calendar, Award, Phone, Settings, Loader2 } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';
import { profileService, ProfileStats } from '../services/profileService';
import { getStorageUrl } from '../services/api';
import { ROUTES } from '../router';

/**
 * Format a date string to French locale format
 */
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Date inconnue';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Date inconnue';
  }
};

/**
 * Get color class based on level
 */
const getLevelColor = (level: string): string => {
  if (['C1', 'C2'].includes(level)) return 'text-green-400';
  if (['B1', 'B2'].includes(level)) return 'text-blue-400';
  return 'text-orange-400';
};

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await profileService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load profile stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (!user) return <div>Non connecté</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header Profile */}
      <GlassCard className="flex flex-col md:flex-row items-center gap-6 p-8 relative">
        <div className="absolute top-4 right-4">
           <Button variant="ghost" onClick={() => navigate(ROUTES.EDIT_PROFILE)} className="text-sm">
             <Settings size={16} /> Éditer le profil
           </Button>
        </div>

        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl overflow-hidden border-4 border-glass-border">
          {user.avatar ? (
            <img src={getStorageUrl(user.avatar) || ''} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <div className="flex flex-col md:flex-row flex-wrap justify-center md:justify-start gap-4 text-slate-400 text-sm">
            <span className="flex items-center gap-1 justify-center md:justify-start"><Mail size={14}/> {user.email}</span>
            {user.phoneNumber && (
              <span className="flex items-center gap-1 justify-center md:justify-start"><Phone size={14}/> {user.phoneNumber}</span>
            )}
            <span className="flex items-center gap-1 justify-center md:justify-start">
              <Calendar size={14}/> Inscrit le {formatDate(user.createdAt)}
            </span>
          </div>
          <div className="pt-2">
            {user.isPremium ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold">
                <Award size={12} /> PREMIUM {user.subscriptionPlan === 'monthly' ? 'MENSUEL' : 'HEBDO'}
              </span>
            ) : (
              <Button variant="secondary" onClick={() => navigate(ROUTES.SUBSCRIPTION)} className="text-xs h-8 px-4">
                Passer Premium
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-6">
         <GlassCard title="Statistiques">
            <h3 className="font-bold mb-4">Progression Globale</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-500" size={24} />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                     <span>Niveau estimé</span>
                     <span className={`font-bold ${getLevelColor(stats?.estimated_level || 'A1')}`}>
                       {stats?.estimated_level || 'A1'}
                     </span>
                  </div>
                  <div className="h-2 bg-glass-200 rounded-full overflow-hidden">
                     <div
                       className="h-full bg-blue-500 transition-all duration-500"
                       style={{ width: `${stats?.level_progress || 0}%` }}
                     ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                   <div className="bg-glass-100 p-3 rounded-lg text-center border border-glass-border">
                      <div className="text-2xl font-bold">{stats?.total_tests || 0}</div>
                      <div className="text-xs text-slate-500">Tests réalisés</div>
                   </div>
                   <div className="bg-glass-100 p-3 rounded-lg text-center border border-glass-border">
                      <div className="text-2xl font-bold text-green-400">{stats?.best_score || 0}</div>
                      <div className="text-xs text-slate-500">Meilleur score</div>
                   </div>
                </div>
              </div>
            )}
         </GlassCard>

         <GlassCard>
            <h3 className="font-bold mb-4">Derniers Résultats</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-500" size={24} />
              </div>
            ) : stats?.recent_history && stats.recent_history.length > 0 ? (
              <div className="space-y-3">
                 {stats.recent_history.map((h) => (
                   <div
                     key={h.id}
                     className="flex justify-between items-center p-3 hover:bg-glass-100 rounded-lg transition-colors border border-transparent hover:border-glass-border cursor-pointer"
                     onClick={() => navigate(ROUTES.ATTEMPT_DETAIL(h.id))}
                   >
                      <div>
                         <div className="font-medium text-sm">{h.module}</div>
                         <div className="text-xs text-slate-500">{formatDate(h.date)}</div>
                      </div>
                      <div className="text-right">
                         <div className="font-bold text-sm">{h.score} pts</div>
                         <div className={`text-xs font-bold ${getLevelColor(h.level)}`}>{h.level}</div>
                      </div>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Aucun test effectué</p>
                <p className="text-xs mt-1">Passez votre premier test pour voir vos résultats ici !</p>
                <Button
                  variant="secondary"
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                  className="mt-4 text-xs"
                >
                  Commencer un test
                </Button>
              </div>
            )}
         </GlassCard>
      </div>
    </div>
  );
};
