import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Award, Calendar, FileText, Headphones, Mic, Loader2, Volume2 } from 'lucide-react';
import { GlassCard, Button, ProgressBar } from '../components/GlassUI';
import { examService, ExamAttemptDetail } from '../services/examService';
import { getStorageUrl } from '../services/api';
import { ModuleType } from '../types';
import { ROUTES } from '../router';

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

const getLevelColor = (level: string) => {
  if (level?.startsWith('C')) return 'text-emerald-400 bg-emerald-500/20';
  if (level?.startsWith('B')) return 'text-blue-400 bg-blue-500/20';
  return 'text-amber-400 bg-amber-500/20';
};

export const AttemptDetail: React.FC = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams<{ attemptId: string }>();
  const activeAttemptId = attemptId ? parseInt(attemptId, 10) : null;
  const [attempt, setAttempt] = useState<ExamAttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    const loadAttempt = async () => {
      if (!activeAttemptId) {
        navigate(ROUTES.HISTORY);
        return;
      }
      try {
        setLoading(true);
        const data = await examService.getAttemptDetail(activeAttemptId);
        setAttempt(data);
      } catch (error) {
        console.error('Failed to load attempt:', error);
        navigate(ROUTES.HISTORY);
      } finally {
        setLoading(false);
      }
    };
    loadAttempt();
  }, [activeAttemptId, navigate]);

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

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!attempt) {
    return null;
  }

  const Icon = getModuleIcon(attempt.module_type);
  const moduleLabel = moduleTypeMap[attempt.module_type] || attempt.module_type;
  const isQCM = attempt.module_type === 'CE' || attempt.module_type === 'CO';
  const correctCount = attempt.questions.filter(q => q.is_correct).length;
  const totalQuestions = attempt.questions.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.HISTORY)}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Détail du Résultat</h1>
          <p className="text-xs text-slate-500">{attempt.exam_title}</p>
        </div>
      </div>

      {/* Score Card */}
      <GlassCard className="mb-6 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Level Badge */}
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${getLevelColor(attempt.level)}`}>
            <div className="text-center">
              <Award size={24} className="mx-auto mb-1" />
              <span className="text-3xl font-bold">{attempt.level}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
            <div>
              <div className="text-sm text-slate-400 mb-1">Score</div>
              <div className="text-2xl font-bold">{attempt.score}<span className="text-sm text-slate-500">/{attempt.max_score}</span></div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Module</div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Icon size={18} />
                <span className="font-semibold">{moduleLabel.split(' ')[0]}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Durée</div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Clock size={16} />
                <span className="font-semibold">{formatTime(attempt.time_spent)}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Date</div>
              <div className="flex items-center gap-2 justify-center md:justify-start text-sm">
                <Calendar size={14} />
                <span>{formatDate(attempt.completed_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accuracy Bar for QCM */}
        {isQCM && (
          <div className="mt-6 pt-6 border-t border-glass-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Précision</span>
              <span className={accuracy >= 70 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}>
                {correctCount}/{totalQuestions} bonnes réponses ({accuracy}%)
              </span>
            </div>
            <ProgressBar value={correctCount} max={totalQuestions} />
          </div>
        )}
      </GlassCard>

      {/* Feedback for Writing/Speaking */}
      {(attempt.module_type === 'EE' || attempt.module_type === 'EO') && attempt.feedback && (
        <GlassCard className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Award size={18} className="text-blue-400" />
            Feedback
          </h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {typeof attempt.feedback === 'object' ? attempt.feedback.text : attempt.feedback}
          </p>
          {attempt.corrected_text && (
            <div className="mt-4 pt-4 border-t border-glass-border">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Texte Corrigé</h4>
              <p className="text-slate-300 leading-relaxed bg-glass-200 p-4 rounded-xl whitespace-pre-wrap">
                {attempt.corrected_text}
              </p>
            </div>
          )}
        </GlassCard>
      )}

      {/* Questions Review for QCM */}
      {isQCM && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-400" />
            Révision des Questions ({correctCount}/{totalQuestions})
          </h3>
          <div className="space-y-3">
            {attempt.questions.map((q, idx) => (
              <GlassCard
                key={q.id}
                className={`cursor-pointer transition-all duration-300 ${
                  q.is_correct
                    ? 'border-l-4 border-l-emerald-500'
                    : 'border-l-4 border-l-red-500'
                }`}
                onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    q.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {q.is_correct ? <Check size={16} /> : <X size={16} />}
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-500">Q{idx + 1}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{q.points} pts</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${expandedQuestion === idx ? '' : 'line-clamp-2'}`}>
                      {q.text}
                    </p>

                    {/* Expanded Details */}
                    {expandedQuestion === idx && (
                      <div className="mt-4 space-y-3 animate-fade-in">
                        {/* Image */}
                        {q.image_url && (
                          <img
                            src={getStorageUrl(q.image_url) || ''}
                            alt="Question"
                            className="max-h-48 rounded-lg border border-glass-border"
                          />
                        )}

                        {/* Audio */}
                        {q.audio_url && (
                          <div className="flex items-center gap-3 bg-glass-200 p-3 rounded-lg">
                            <Volume2 size={18} className="text-blue-400" />
                            <audio src={getStorageUrl(q.audio_url) || ''} controls className="h-8 flex-1" />
                          </div>
                        )}

                        {/* Choices */}
                        {q.choices && q.choices.length > 0 && (
                          <div className="space-y-2">
                            {q.choices.map((choice, choiceIdx) => {
                              const isUserAnswer = q.user_answer === choiceIdx;
                              const isCorrectAnswer = q.correct_answer === choiceIdx;

                              let choiceClass = 'bg-glass-200 border-glass-border text-slate-400';
                              if (isCorrectAnswer) {
                                choiceClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
                              } else if (isUserAnswer && !isCorrectAnswer) {
                                choiceClass = 'bg-red-500/20 border-red-500/50 text-red-300';
                              }

                              return (
                                <div
                                  key={choiceIdx}
                                  className={`flex items-center gap-3 p-3 rounded-lg border ${choiceClass}`}
                                >
                                  <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0">
                                    {String.fromCharCode(65 + choiceIdx)}
                                  </span>
                                  <span className="text-sm">{choice}</span>
                                  {isCorrectAnswer && (
                                    <Check size={16} className="ml-auto text-emerald-400" />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <X size={16} className="ml-auto text-red-400" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8 flex justify-center">
        <Button onClick={() => navigate(ROUTES.HISTORY)} variant="secondary">
          <ArrowLeft size={18} className="mr-2" />
          Retour à l'historique
        </Button>
      </div>
    </div>
  );
};
