import React, { useState, useEffect } from 'react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, Eye, RotateCcw, ArrowLeft } from 'lucide-react';
import { ProgressBar } from '../components/GlassUI';
import { ModuleType } from '../types';

export const ResultsView: React.FC = () => {
  const { setView } = useAppStore();
  const [result, setResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lastExamResult');
    if (saved) {
      setResult(JSON.parse(saved));
    }
  }, []);

  if (!result) return <div className="p-8 text-center">Aucun résultat trouvé.</div>;

  // Correction is relevant mainly for Reading/Listening (QCM) or if we have detailed QCM data
  const hasQCMCorrection = (result.module === ModuleType.READING || result.module === ModuleType.LISTENING) && result.questions;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto flex flex-col items-center animate-fade-in">
      <div className="w-full text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 text-glass-text">Résultats de la Simulation</h1>
        <p className="text-slate-500">{result.module}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full mb-8">
        {/* Score Card */}
        <GlassCard className="flex flex-col items-center justify-center py-12 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-glass-text to-slate-500 mb-2">
            {result.score} <span className="text-2xl text-slate-500 font-normal">/ 699</span>
          </div>
          <div className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-bold mt-4 border border-glass-border ${
            ['C1', 'C2'].includes(result.level) ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
          }`}>
            Niveau {result.level}
          </div>
        </GlassCard>

        {/* Quick Stats */}
        <GlassCard className="flex flex-col justify-center space-y-6">
           <h3 className="font-bold border-b border-glass-border pb-2">Analyse rapide</h3>
           <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1"><span>Précision</span> <span className="text-green-500">78%</span></div>
                <ProgressBar value={78} max={100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span>Gestion du temps</span> <span className="text-blue-500">Bien</span></div>
                <ProgressBar value={85} max={100} />
              </div>
           </div>
        </GlassCard>
      </div>

      {/* Writing/Speaking AI Feedback */}
      {result.feedback && (
        <div className="w-full mb-8">
          <Button 
            variant="secondary" 
            className="w-full flex justify-between items-center mb-4"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span>Voir l'analyse IA détaillée</span>
            {showDetails ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
          </Button>

          {showDetails && (
            <div className="space-y-6 animate-fade-in-down">
               <GlassCard>
                  <h3 className="text-lg font-bold mb-4 text-blue-400">Feedback Général</h3>
                  <p className="text-glass-text leading-relaxed">{result.feedback}</p>
                  
                  {result.details && (
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                       <div className="bg-glass-100 p-3 rounded-lg border border-glass-border">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Grammaire</div>
                          <p className="text-sm">{result.details.grammar}</p>
                       </div>
                       <div className="bg-glass-100 p-3 rounded-lg border border-glass-border">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Vocabulaire</div>
                          <p className="text-sm">{result.details.vocabulary}</p>
                       </div>
                       <div className="bg-glass-100 p-3 rounded-lg border border-glass-border">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Cohérence</div>
                          <p className="text-sm">{result.details.coherence}</p>
                       </div>
                    </div>
                  )}
               </GlassCard>

               {result.correctedText && (
                 <GlassCard>
                    <h3 className="text-lg font-bold mb-4 text-green-400">Correction Suggérée</h3>
                    <div className="bg-glass-100 p-4 rounded-xl border border-glass-border text-sm leading-7 whitespace-pre-wrap font-mono text-slate-400">
                       {result.correctedText}
                    </div>
                 </GlassCard>
               )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <Button onClick={() => setView('DASHBOARD')} variant="secondary" icon={ArrowLeft}>
          Retour au Dashboard
        </Button>
        
        {hasQCMCorrection && (
          <Button onClick={() => setView('CORRECTION')} variant="secondary" className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300" icon={Eye}>
            Voir la correction
          </Button>
        )}

        <Button onClick={() => setView('EXAM_RUNNER')} variant="primary" icon={RotateCcw}>
          Refaire un test
        </Button>
      </div>
    </div>
  );
};