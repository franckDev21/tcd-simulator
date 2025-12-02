import React, { useState, useEffect } from 'react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';
import { Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { UserResult } from '../types';

export const Correction: React.FC = () => {
  const { setView } = useAppStore();
  const [result, setResult] = useState<UserResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lastExamResult');
    if (saved) {
      setResult(JSON.parse(saved));
    }
  }, []);

  if (!result || !result.questions) return <div className="p-8 text-center text-slate-400">Aucune donnée de correction disponible.</div>;

  const totalQuestions = result.questions.length;
  const correctCount = result.questions.filter(q => result.userAnswers?.[q.id] === q.correctAnswer).length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => setView('RESULTS')} className="pl-2">
          <ArrowLeft size={18} /> Retour aux résultats
        </Button>
        <div className="text-lg font-bold">Correction Détaillée</div>
      </div>

      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-white mb-1">Votre Bilan</h2>
            <p className="text-slate-300">{correctCount} bonnes réponses sur {totalQuestions}</p>
         </div>
         <div className="text-4xl font-black text-blue-400">
            {Math.round((correctCount/totalQuestions)*100)}%
         </div>
      </div>

      <div className="space-y-8">
        {result.questions.map((q, idx) => {
          const userAnswer = result.userAnswers?.[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          const isSkipped = userAnswer === undefined;

          return (
            <GlassCard key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : isSkipped ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-glass-200 text-sm font-medium">
                  Question {idx + 1}
                  {isCorrect && <Check size={14} className="text-green-500" />}
                  {!isCorrect && !isSkipped && <X size={14} className="text-red-500" />}
                  {isSkipped && <AlertCircle size={14} className="text-yellow-500" />}
                </span>
                <span className={`text-sm font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? '+ ' + q.points + ' pts' : '0 pt'}
                </span>
              </div>

              <h3 className="text-lg font-medium mb-6">{q.text}</h3>

              {q.assetUrl && q.assetUrl !== 'AUDIO_PLACEHOLDER' && (
                 <div className="mb-6 p-2 bg-black/20 rounded-xl border border-glass-border">
                    <img src={q.assetUrl} alt="Contexte" className="h-48 object-contain mx-auto" />
                 </div>
              )}

              <div className="space-y-3">
                {q.options?.map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isActuallyCorrect = q.correctAnswer === optIdx;
                  
                  let itemClass = "p-4 rounded-xl border flex items-center justify-between text-sm transition-all ";
                  
                  if (isActuallyCorrect) {
                    itemClass += "bg-green-500/10 border-green-500/50 text-green-100";
                  } else if (isSelected && !isActuallyCorrect) {
                    itemClass += "bg-red-500/10 border-red-500/50 text-red-100";
                  } else {
                    itemClass += "bg-glass-100 border-glass-border text-slate-400 opacity-60";
                  }

                  return (
                    <div key={optIdx} className={itemClass}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold
                           ${isActuallyCorrect ? 'bg-green-500 border-green-500 text-white' : 
                             isSelected ? 'bg-red-500 border-red-500 text-white' : 
                             'border-slate-500 text-slate-500'}
                        `}>
                           {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span>{opt}</span>
                      </div>
                      {isActuallyCorrect && <Check size={16} className="text-green-500" />}
                      {isSelected && !isActuallyCorrect && <X size={16} className="text-red-500" />}
                    </div>
                  );
                })}
              </div>

              {isSkipped && (
                 <div className="mt-4 text-sm text-yellow-500 flex items-center gap-2">
                    <AlertCircle size={14} /> Vous n'avez pas répondu à cette question.
                 </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};