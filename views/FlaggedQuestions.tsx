import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, Check, X, Trash2, ArrowLeft, Loader2, BookOpen, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { flaggedQuestionsService, FlaggedQuestion, FlagReason } from '../services/flaggedQuestionsService';
import { getStorageUrl } from '../services/api';
import { ROUTES } from '../router';

export const FlaggedQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<FlaggedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      // 'all' = no filter, 'resolved' = true, 'unresolved' = false
      const resolved = filter === 'all' ? undefined : filter === 'resolved';
      const data = await flaggedQuestionsService.getAll({ resolved });
      // Ensure we always have an array
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load flagged questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [filter]);

  const handleResolve = async (id: number) => {
    try {
      setActionLoading(id);
      await flaggedQuestionsService.resolve(id);
      setQuestions(prev => prev.map(q =>
        q.id === id ? { ...q, is_resolved: true } : q
      ));
      if (filter === 'unresolved') {
        setQuestions(prev => prev.filter(q => q.id !== id));
      }
    } catch (error) {
      console.error('Failed to resolve question:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      setActionLoading(id);
      await flaggedQuestionsService.remove(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to remove flagged question:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearResolved = async () => {
    if (!confirm('Supprimer toutes les questions résolues ?')) return;
    try {
      setLoading(true);
      await flaggedQuestionsService.clearResolved();
      await loadQuestions();
    } catch (error) {
      console.error('Failed to clear resolved questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: FlagReason) => {
    switch (reason) {
      case 'review': return 'À réviser';
      case 'difficult': return 'Difficile';
      case 'unsure': return 'Incertain';
      default: return reason;
    }
  };

  const getReasonColor = (reason: FlagReason) => {
    switch (reason) {
      case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'difficult': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'unsure': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="mb-2 -ml-2"
          >
            <ArrowLeft size={16} className="mr-1" /> Retour
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border border-yellow-500/50 flex items-center justify-center">
              <BookOpen size={24} className="text-yellow-400" />
            </div>
            Questions à réviser
          </h1>
          <p className="text-slate-400 mt-2">
            Révisez les questions que vous avez marquées pour améliorer vos performances
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('unresolved')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'unresolved'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
              : 'bg-glass-100 text-slate-400 border border-glass-border hover:bg-glass-200'
          }`}
        >
          <Flag size={14} className="inline mr-2" />
          Non résolues
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'resolved'
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-glass-100 text-slate-400 border border-glass-border hover:bg-glass-200'
          }`}
        >
          <Check size={14} className="inline mr-2" />
          Résolues
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
              : 'bg-glass-100 text-slate-400 border border-glass-border hover:bg-glass-200'
          }`}
        >
          Toutes
        </button>

        {filter === 'resolved' && questions.length > 0 && (
          <button
            onClick={handleClearResolved}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={14} className="inline mr-2" />
            Vider
          </button>
        )}
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : questions.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Flag size={48} className="mx-auto mb-4 text-slate-500 opacity-50" />
          <h3 className="text-xl font-semibold text-slate-400">
            {filter === 'unresolved' ? 'Aucune question à réviser' :
             filter === 'resolved' ? 'Aucune question résolue' :
             'Aucune question marquée'}
          </h3>
          <p className="text-slate-500 mt-2">
            {filter === 'unresolved'
              ? 'Marquez des questions pendant vos tests pour les retrouver ici'
              : 'Les questions résolues apparaîtront ici'}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {questions.map((item, idx) => {
            const isExpanded = expandedId === item.id;
            const q = item.question;

            return (
              <GlassCard
                key={item.id}
                className={`transition-all animate-fade-in-up ${item.is_resolved ? 'opacity-70' : ''}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Question Header */}
                <div
                  className="flex items-start gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.is_resolved
                      ? 'bg-green-500/20 border border-green-500/50'
                      : 'bg-yellow-500/20 border border-yellow-500/50'
                  }`}>
                    {item.is_resolved ? (
                      <Check size={18} className="text-green-400" />
                    ) : (
                      <Flag size={18} className="text-yellow-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${getReasonColor(item.reason)}`}>
                        {getReasonLabel(item.reason)}
                      </span>
                      {q.exam_series && (
                        <span className="text-xs text-slate-500">
                          {q.exam_series.title} • {q.exam_series.module_type}
                        </span>
                      )}
                    </div>
                    <p className="text-glass-text line-clamp-2">{q.text}</p>
                  </div>

                  <button className="p-2 text-slate-400 hover:text-white transition-colors shrink-0">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-glass-border animate-fade-in">
                    {/* Question Media */}
                    {q.image_url && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-glass-border">
                        <img
                          src={getStorageUrl(q.image_url) || ''}
                          alt="Question"
                          className="w-full h-auto max-h-[300px] object-contain bg-black/30"
                        />
                      </div>
                    )}

                    {q.audio_url && (
                      <div className="mb-4 bg-glass-200 p-4 rounded-xl flex items-center gap-4 border border-glass-border">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                          <Volume2 size={18} />
                        </div>
                        <audio controls src={getStorageUrl(q.audio_url) || ''} className="flex-1 h-10" />
                      </div>
                    )}

                    {/* Full Question Text */}
                    <p className="text-glass-text text-lg leading-relaxed mb-6">{q.text}</p>

                    {/* Options with Correct Answer */}
                    {q.choices && q.choices.length > 0 && (
                      <div className="space-y-2 mb-6">
                        {q.choices.map((choice, choiceIdx) => {
                          const isCorrect = q.correct_answer === choiceIdx;
                          return (
                            <div
                              key={choiceIdx}
                              className={`p-3 rounded-xl border flex items-center gap-3 ${
                                isCorrect
                                  ? 'bg-green-500/20 border-green-500/50 text-green-300'
                                  : 'bg-glass-100 border-glass-border text-slate-400'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCorrect
                                  ? 'bg-green-500/30 border-2 border-green-500'
                                  : 'bg-slate-700/50 border-2 border-slate-600'
                              }`}>
                                {String.fromCharCode(65 + choiceIdx)}
                              </div>
                              <span className="flex-1">{choice}</span>
                              {isCorrect && <Check size={18} className="text-green-400" />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <div className="mb-6 p-4 bg-glass-200 rounded-xl border border-glass-border">
                        <p className="text-sm text-slate-400 font-medium mb-1">Notes:</p>
                        <p className="text-glass-text">{item.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      {!item.is_resolved && (
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(item.id);
                          }}
                          disabled={actionLoading === item.id}
                          className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400"
                        >
                          {actionLoading === item.id ? (
                            <Loader2 size={16} className="animate-spin mr-2" />
                          ) : (
                            <Check size={16} className="mr-2" />
                          )}
                          Marquer comme révisée
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.id);
                        }}
                        disabled={actionLoading === item.id}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 size={16} className="animate-spin mr-2" />
                        ) : (
                          <Trash2 size={16} className="mr-2" />
                        )}
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
