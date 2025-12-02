import React, { useState, useEffect } from 'react';
import { ModuleType, Question, CorrectionResult, UserResult } from '../types';
import { GlassCard, Button, ProgressBar } from '../components/GlassUI';
import { Timer, Volume2, Flag, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { gradeWritingSubmission } from '../services/geminiService';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useAppStore } from '../store/useAppStore';

interface ExamRunnerProps {
  module: ModuleType;
  questions: Question[];
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({ module, questions }) => {
  const { setView, completeExam } = useAppStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [loadingCorrection, setLoadingCorrection] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correctionResult, setCorrectionResult] = useState<CorrectionResult | null>(null);

  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  const handleFinish = async () => {
    setIsFinished(true);
    
    // Simulate grading for Writing
    if (module === ModuleType.WRITING) {
      setLoadingCorrection(true);
      const text = answers[questions[0].id] || "";
      const result = await gradeWritingSubmission(questions[0].text, text);
      setCorrectionResult(result);
      setLoadingCorrection(false);
      
      const examResult: UserResult = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        module,
        score: result.score,
        maxScore: 699,
        level: result.level,
        feedback: result.feedback,
        correctionJson: result,
        questions: questions,
        userAnswers: answers
      };

      localStorage.setItem('lastExamResult', JSON.stringify(examResult));
      completeExam(); 
    } 
    // Basic Scoring for others (Reading/Listening)
    else {
        let score = 0;
        let maxScore = 0;
        questions.forEach(q => {
            maxScore += q.points;
            if (answers[q.id] === q.correctAnswer) {
            score += q.points;
            }
        });
        const normalizedScore = Math.round((score / maxScore) * 699);
        
        const examResult: UserResult = { 
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            module, 
            score: normalizedScore, 
            maxScore: 699, 
            level: getLevel(normalizedScore),
            questions: questions,
            userAnswers: answers
        };

        localStorage.setItem('lastExamResult', JSON.stringify(examResult));
        completeExam();
    }
  };

  const getLevel = (score: number) => {
    if (score < 100) return "A1";
    if (score < 200) return "A2";
    if (score < 300) return "B1";
    if (score < 400) return "B2";
    if (score < 500) return "C1";
    return "C2";
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFlag = (qId: number) => {
    setFlagged(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (loadingCorrection) {
    return (
      <div className="h-[80vh] flex items-center justify-center flex-col animate-fade-in">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold">Analyse par IA...</h2>
        <p className="text-slate-500 mt-2">Notre moteur corrige votre copie et génère des conseils.</p>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  // --- NAVIGATION COMPONENT ---
  const QuestionNavigator = () => (
    <div className="mb-6 animate-fade-in">
      <div className="bg-glass-100 border border-glass-border rounded-xl p-4">
        {/* Grid of Numbers */}
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar justify-start content-start">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentIdx;
            const isFlagged = flagged[q.id];

            let btnClass = "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 border ";
            
            if (isCurrent) {
               // Current: White/Glass Highlight with ring
               btnClass += "bg-white text-black border-blue-500 ring-2 ring-blue-500/30 scale-110 shadow-lg font-bold";
            } else if (isFlagged) {
               // Review: Yellow
               btnClass += "bg-yellow-400 text-yellow-900 border-yellow-500 shadow-md";
            } else if (isAnswered) {
               // Answered: Dark
               btnClass += "bg-slate-700 text-white border-slate-600";
            } else {
               // Default
               btnClass += "bg-glass-200 text-slate-400 border-transparent hover:bg-glass-300";
            }

            return (
              <button 
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={btnClass}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-glass-border text-xs text-slate-400">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-white border border-blue-500 ring-1 ring-blue-500/30"></div>
             <span>Actuel</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500"></div>
             <span>Révision</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600"></div>
             <span>Répondu</span>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col min-h-[calc(100vh-64px)]">
      {/* Top Header with Timer */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setView('DASHBOARD')} className="px-2">✕</Button>
          <div className="text-xl font-bold">{module}</div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-mono transition-colors ${timeLeft < 300 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-glass-100 border-glass-border text-blue-400'}`}>
          <Timer size={16} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar value={Object.keys(answers).length} max={questions.length} label={`Progression: ${Math.round((Object.keys(answers).length / questions.length) * 100)}%`} />
      </div>

      {/* Question Navigator (The requested feature) */}
      <QuestionNavigator />

      {/* Main Question Card */}
      <GlassCard className="flex flex-col relative min-h-[500px]">
        {module === ModuleType.READING || module === ModuleType.LISTENING ? (
          <div className="flex flex-col h-full">
            {/* Scrollable Content - Removed overflow-y-auto to let it grow naturally */}
            <div className="pb-28">
              
              {/* Question Header & Flag */}
              <div className="flex justify-between items-start mb-4">
                <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-bold">
                  Question {currentIdx + 1}
                </span>
                <button 
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`flex items-center gap-1 text-sm px-3 py-1 rounded-lg transition-colors border ${
                    flagged[currentQ.id] 
                      ? 'bg-yellow-400/20 text-yellow-400 border-yellow-500/50' 
                      : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/5'
                  }`}
                >
                  <Flag size={14} fill={flagged[currentQ.id] ? "currentColor" : "none"} />
                  {flagged[currentQ.id] ? 'Marqué pour révision' : 'Marquer'}
                </button>
              </div>

              {currentQ.assetUrl && currentQ.assetUrl !== 'AUDIO_PLACEHOLDER' && (
                <img src={currentQ.assetUrl} alt="Document" className="w-full h-auto max-h-[500px] object-contain rounded-xl mb-6 border border-glass-border bg-black/20" />
              )}
              
              {module === ModuleType.LISTENING && (
                <div className="bg-glass-200 p-4 rounded-xl flex items-center gap-4 mb-6 border border-glass-border">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <Volume2 size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="h-1 bg-glass-border rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-blue-500 animate-pulse"></div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">00:15 / 00:45</span>
                </div>
              )}

              <h3 className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">{currentQ.text}</h3>
              
              <div className="space-y-4">
                {currentQ.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentQ.id]: idx })}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center gap-4 group ${
                      answers[currentQ.id] === idx 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-glass-100 border-glass-border hover:bg-glass-200 text-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-full border flex items-center justify-center text-sm font-bold transition-colors ${
                      answers[currentQ.id] === idx 
                        ? 'bg-white text-blue-600 border-white' 
                        : 'border-slate-500 text-slate-500 group-hover:border-slate-300 group-hover:text-slate-300'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Footer Navigation */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-glass-bg/95 backdrop-blur-xl border-t border-glass-border flex justify-between z-10 rounded-b-2xl">
              <Button 
                variant="ghost" 
                disabled={currentIdx === 0}
                onClick={() => {
                   setCurrentIdx(prev => prev - 1);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="pl-2"
              >
                <ChevronLeft size={18} /> Précédent
              </Button>
              {isLast ? (
                <Button onClick={handleFinish} variant="primary" icon={Check}>Terminer le test</Button>
              ) : (
                <Button onClick={() => {
                   setCurrentIdx(prev => prev + 1);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }} variant="secondary">
                  Suivant <ChevronRight size={18} />
                </Button>
              )}
            </div>
          </div>
        ) : module === ModuleType.WRITING ? (
          <div className="flex flex-col h-full">
            <div className="mb-4 text-slate-300 bg-glass-200 p-4 rounded-xl border border-glass-border leading-relaxed">
              {currentQ.text}
            </div>
            <textarea
              className="flex-1 w-full bg-glass-100 border border-glass-border rounded-xl p-4 text-glass-text outline-none focus:border-blue-500/50 resize-none font-sans leading-relaxed transition-all focus:bg-glass-200 min-h-[400px]"
              placeholder="Écrivez votre réponse ici..."
              value={answers[currentQ.id] || ''}
              onChange={(e) => setAnswers({...answers, [currentQ.id]: e.target.value})}
            />
            <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
              <span>{answers[currentQ.id]?.length || 0} caractères</span>
              <Button onClick={handleFinish} loading={loadingCorrection}>Soumettre pour correction</Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-12">
             <div className="bg-glass-200 p-6 rounded-2xl border border-glass-border max-w-lg">
                <h3 className="text-lg font-medium mb-2">{currentQ.text}</h3>
                <p className="text-sm text-slate-400">Prenez le temps de préparer votre réponse, puis enregistrez-vous.</p>
             </div>
             
             <VoiceRecorder onRecordingComplete={(url) => {
                 setAnswers({...answers, [currentQ.id]: url});
             }} />
             
             {answers[currentQ.id] && (
                 <Button onClick={handleFinish} className="mt-8">Terminer l'épreuve</Button>
             )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};