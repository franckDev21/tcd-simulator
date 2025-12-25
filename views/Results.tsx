import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../components/GlassUI';
import { ChevronDown, ChevronUp, Eye, RotateCcw, ArrowLeft, Download, Check, X, Flag, MinusCircle } from 'lucide-react';
import { ProgressBar } from '../components/GlassUI';
import { ModuleType, Question } from '../types';
import { jsPDF } from 'jspdf';
import { ROUTES } from '../router';
import { getStorageUrl } from '../services/api';

export const ResultsView: React.FC = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number | null>(null);
  const [showLevelAnimation, setShowLevelAnimation] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lastExamResult');
    if (saved) {
      const parsed = JSON.parse(saved);
      setResult(parsed);

      // Also get flagged questions from localStorage (saved during exam)
      const flaggedData = localStorage.getItem('lastExamFlagged');
      if (flaggedData) {
        parsed.flaggedQuestions = JSON.parse(flaggedData);
        setResult({ ...parsed });
      }
    }

    // Trigger level animation after a short delay
    setTimeout(() => setShowLevelAnimation(true), 500);
  }, []);

  // ============================================
  // ALGORITHME 1: Précision (Accuracy)
  // ============================================
  // Calcule le pourcentage de bonnes réponses
  // Pour QCM: (nombre de bonnes réponses / nombre total de questions) * 100
  // Pour Expression Écrite: basé sur le score normalisé
  const calculateAccuracy = () => {
    if (!result) return { value: 0, display: '0%' };

    // Pour les modules QCM (CE, CO)
    if (result.correctCount !== undefined && result.totalQuestions !== undefined && result.totalQuestions > 0) {
      const accuracy = Math.round((result.correctCount / result.totalQuestions) * 100);
      return { value: accuracy, display: `${accuracy}%` };
    }

    // Pour Expression Écrite/Orale: utiliser le ratio score/maxScore
    if (result.score !== undefined && result.maxScore !== undefined && result.maxScore > 0) {
      const accuracy = Math.round((result.score / result.maxScore) * 100);
      return { value: accuracy, display: `${accuracy}%` };
    }

    return { value: 0, display: 'N/A' };
  };

  // ============================================
  // ALGORITHME 2: Gestion du temps (Time Management)
  // ============================================
  // Analyse la performance temporelle du candidat
  //
  // Pour les QCM (CE, CO): On veut que le candidat utilise 30-95% du temps
  // Pour Expression (EE, EO): Le temps minimum acceptable est basé sur le temps absolu
  //   - Expression écrite: minimum 5 min pour une rédaction correcte
  //   - L'important est de ne pas dépasser le temps
  const calculateTimeManagement = () => {
    if (!result || !result.timeSpent || !result.totalTime || result.totalTime === 0) {
      return { value: 50, display: 'N/A', label: 'Non mesuré' };
    }

    const timeSpentMinutes = result.timeSpent / 60;
    const timeRatio = result.timeSpent / result.totalTime;
    const isExpressionModule = result.module === ModuleType.WRITING || result.module === ModuleType.SPEAKING;

    // Pour les modules d'expression, on évalue différemment
    if (isExpressionModule) {
      // Temps dépassé = Insuffisant
      if (timeRatio > 1.0) {
        const overrunPenalty = Math.min(30, (timeRatio - 1.0) * 100);
        return {
          value: Math.max(10, 40 - overrunPenalty),
          display: 'Insuffisant',
          label: 'Temps dépassé'
        };
      }

      // Pour expression écrite/orale, on veut au moins 5 minutes de réflexion
      // Excellent: >= 10 min et <= 85% du temps
      // Bien: >= 5 min et <= 95% du temps
      // Acceptable: >= 3 min
      // Moyen: < 3 min
      if (timeSpentMinutes >= 10 && timeRatio <= 0.85) {
        return { value: 95, display: 'Excellent', label: 'Temps bien utilisé' };
      }
      if (timeSpentMinutes >= 5 && timeRatio <= 0.95) {
        return { value: 80, display: 'Bien', label: 'Bonne gestion' };
      }
      if (timeSpentMinutes >= 3) {
        return { value: 65, display: 'Acceptable', label: 'Un peu rapide' };
      }
      return { value: 45, display: 'Moyen', label: 'Très rapide' };
    }

    // Pour les QCM (CE, CO)
    // Cas 1: Temps optimal (50-90% du temps utilisé)
    if (timeRatio >= 0.50 && timeRatio <= 0.90) {
      const score = 85 + Math.round((1 - Math.abs(0.70 - timeRatio) / 0.20) * 15);
      return {
        value: Math.min(100, score),
        display: 'Excellent',
        label: 'Gestion optimale du temps'
      };
    }

    // Cas 2: Bien géré mais améliorable (30-50% ou 90-100%)
    if ((timeRatio >= 0.30 && timeRatio < 0.50) || (timeRatio > 0.90 && timeRatio <= 1.0)) {
      return {
        value: 75,
        display: 'Bien',
        label: timeRatio < 0.50 ? 'Un peu rapide' : 'Temps serré'
      };
    }

    // Cas 3: Trop rapide (moins de 30%)
    if (timeRatio < 0.30) {
      const score = 40 + Math.round((timeRatio / 0.30) * 25);
      return {
        value: Math.max(40, score),
        display: 'Moyen',
        label: 'Réponses précipitées'
      };
    }

    // Cas 4: Temps dépassé (plus de 100%)
    const overrunPenalty = Math.min(30, (timeRatio - 1.0) * 100);
    return {
      value: Math.max(10, 40 - overrunPenalty),
      display: 'Insuffisant',
      label: 'Temps dépassé'
    };
  };

  const accuracy = calculateAccuracy();
  const timeManagement = calculateTimeManagement();

  if (!result) return <div className="p-8 text-center">Aucun résultat trouvé.</div>;

  // Correction is relevant mainly for Reading/Listening (QCM) or if we have detailed QCM data
  const hasQCMCorrection = (result.module === ModuleType.READING || result.module === ModuleType.LISTENING) && result.questions;

  const handleExportPDF = () => {
    // @ts-ignore
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    let yPos = 20;

    // Helper to check page break
    const checkPageBreak = (heightNeeded: number) => {
      if (yPos + heightNeeded > pageHeight - margin) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Header Background
    doc.setFillColor(79, 70, 229); // Primary Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Rapport de Performance", margin, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("PRIMO", margin, 30);

    yPos = 55;

    // Meta Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Module :`, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(result.module, margin + 25, yPos);
    yPos += 7;

    doc.setFont("helvetica", "bold");
    doc.text(`Date :`, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(result.date, margin + 25, yPos);
    yPos += 7;

    doc.setFont("helvetica", "bold");
    doc.text(`Niveau :`, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${result.level} (${result.score}/699)`, margin + 25, yPos);
    yPos += 15;

    // Separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // 1. Sujet (Prompt)
    if (result.questions && result.questions.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text("Sujet", margin, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80, 80, 80);
        
        const questionText = result.questions[0].text;
        const splitQuestion = doc.splitTextToSize(questionText, maxLineWidth);
        doc.text(splitQuestion, margin, yPos);
        yPos += (splitQuestion.length * 6) + 10;
    }

    // 2. User Answer
    if (result.userAnswers && result.questions && result.questions.length > 0) {
        const qId = result.questions[0].id;
        const answer = result.userAnswers[qId];
        
        if (answer && typeof answer === 'string') {
            checkPageBreak(30);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(50, 50, 50);
            doc.text("Votre Rédaction", margin, yPos);
            yPos += 8;

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            
            const splitAnswer = doc.splitTextToSize(answer, maxLineWidth);
            
            splitAnswer.forEach((line: string) => {
                if (yPos > pageHeight - margin) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, margin, yPos);
                yPos += 6;
            });
            yPos += 10;
        }
    }

    // 3. Feedback
    if (result.feedback) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(79, 70, 229); // Indigo
        doc.text("Correction & Analyse IA", margin, yPos);
        yPos += 8;
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        
        const splitFeedback = doc.splitTextToSize(result.feedback, maxLineWidth);
        splitFeedback.forEach((line: string) => {
            if (yPos > pageHeight - margin) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, margin, yPos);
            yPos += 6;
        });
        yPos += 10;
    }
    
    // 4. Corrected Text
    if (result.correctedText) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(34, 197, 94); // Green
        doc.text("Suggestion Améliorée", margin, yPos);
        yPos += 8;
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        
        const splitCorrected = doc.splitTextToSize(result.correctedText, maxLineWidth);
        splitCorrected.forEach((line: string) => {
            if (yPos > pageHeight - margin) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, margin, yPos);
            yPos += 6;
        });
    }

    doc.save(`PRIMO_Expression_Ecrite_${result.date}.pdf`);
  };

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
          {/* Animated Level Badge */}
          <div className={`inline-flex items-center px-6 py-2 rounded-full text-lg font-bold mt-4 border-2 transition-all duration-700 transform ${
            showLevelAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          } ${
            ['C1', 'C2'].includes(result.level)
              ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-400 border-green-500/50 shadow-lg shadow-green-500/20'
              : ['B1', 'B2'].includes(result.level)
              ? 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-400 border-blue-500/50 shadow-lg shadow-blue-500/20'
              : 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-400 border-amber-500/50 shadow-lg shadow-amber-500/20'
          } ${showLevelAnimation ? 'animate-pulse-slow' : ''}`}>
            <span className="mr-2">Niveau</span>
            <span className={`text-2xl font-black ${showLevelAnimation ? 'animate-bounce-subtle' : ''}`}>{result.level}</span>
          </div>
        </GlassCard>

        {/* Quick Stats */}
        <GlassCard className="flex flex-col justify-center space-y-6">
           <h3 className="font-bold border-b border-glass-border pb-2">Analyse rapide</h3>
           <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Précision</span>
                  <span className={accuracy.value >= 70 ? 'text-green-500' : accuracy.value >= 50 ? 'text-yellow-500' : 'text-red-500'}>
                    {accuracy.display}
                  </span>
                </div>
                <ProgressBar value={accuracy.value} max={100} />
                {result.correctCount !== undefined && result.totalQuestions !== undefined && (
                  <p className="text-xs text-slate-500 mt-1">{result.correctCount} / {result.totalQuestions} bonnes réponses</p>
                )}
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Gestion du temps</span>
                  <span className={
                    timeManagement.display === 'Excellent' ? 'text-green-500' :
                    timeManagement.display === 'Bien' ? 'text-blue-500' :
                    timeManagement.display === 'Moyen' ? 'text-yellow-500' :
                    timeManagement.display === 'Insuffisant' ? 'text-red-500' : 'text-slate-400'
                  }>
                    {timeManagement.display}
                  </span>
                </div>
                <ProgressBar value={timeManagement.value} max={100} />
                {result.timeSpent !== undefined && result.totalTime !== undefined && (
                  <p className="text-xs text-slate-500 mt-1">
                    {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')} / {Math.floor(result.totalTime / 60)}:{(result.totalTime % 60).toString().padStart(2, '0')} • {timeManagement.label}
                  </p>
                )}
              </div>
           </div>
        </GlassCard>
      </div>

      {/* Question Navigator - Only for QCM modules */}
      {hasQCMCorrection && result.questions && result.questions.length > 0 && (
        <div className="w-full mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye size={18} className="text-blue-400" />
              Aperçu des Questions
            </h3>

            {/* Question Navigator Grid */}
            <div className="flex flex-wrap gap-2 mb-4">
              {result.questions.map((q: Question, idx: number) => {
                const userAnswer = result.userAnswers?.[q.id];
                const isCorrect = userAnswer === q.correctAnswer;
                const isSkipped = userAnswer === undefined || userAnswer === null;
                const isFlagged = result.flaggedQuestions?.[q.id];
                const isSelected = selectedQuestionIdx === idx;

                // Determine button style based on state
                let btnClass = "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 border-2 cursor-pointer transform hover:scale-110 ";

                if (isFlagged) {
                  // Yellow for flagged/review
                  btnClass += "bg-yellow-500/30 text-yellow-300 border-yellow-500 hover:bg-yellow-500/40";
                } else if (isSkipped) {
                  // White/neutral for skipped
                  btnClass += "bg-slate-700/50 text-slate-300 border-slate-500 hover:bg-slate-600/50";
                } else if (isCorrect) {
                  // Green for correct
                  btnClass += "bg-green-500/30 text-green-300 border-green-500 hover:bg-green-500/40";
                } else {
                  // Red for wrong
                  btnClass += "bg-red-500/30 text-red-300 border-red-500 hover:bg-red-500/40";
                }

                // Add selected state
                if (isSelected) {
                  btnClass += " ring-2 ring-white/50 scale-110";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestionIdx(isSelected ? null : idx)}
                    className={btnClass}
                    title={`Question ${idx + 1}: ${isSkipped ? 'Ignorée' : isCorrect ? 'Correcte' : 'Incorrecte'}${isFlagged ? ' (marquée à réviser)' : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-glass-border text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-green-500/30 border border-green-500 flex items-center justify-center">
                  <Check size={10} className="text-green-300" />
                </span>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-red-500/30 border border-red-500 flex items-center justify-center">
                  <X size={10} className="text-red-300" />
                </span>
                <span>Incorrect</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-slate-700/50 border border-slate-500 flex items-center justify-center">
                  <MinusCircle size={10} className="text-slate-300" />
                </span>
                <span>Ignoré</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-yellow-500/30 border border-yellow-500 flex items-center justify-center">
                  <Flag size={10} className="text-yellow-300" />
                </span>
                <span>À réviser</span>
              </div>

              {/* Stats */}
              <div className="ml-auto flex gap-4 text-xs">
                <span className="text-green-400">{result.correctCount || 0} correct{(result.correctCount || 0) > 1 ? 's' : ''}</span>
                <span className="text-red-400">{(result.totalQuestions || 0) - (result.correctCount || 0)} incorrect{((result.totalQuestions || 0) - (result.correctCount || 0)) > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Selected Question Preview */}
            {selectedQuestionIdx !== null && result.questions[selectedQuestionIdx] && (
              <div className="mt-6 pt-6 border-t border-glass-border animate-fade-in">
                {(() => {
                  const q = result.questions[selectedQuestionIdx];
                  const userAnswer = result.userAnswers?.[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  const isSkipped = userAnswer === undefined || userAnswer === null;

                  return (
                    <div className="space-y-4">
                      {/* Question Header */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          isSkipped ? 'bg-slate-700/50 text-slate-300' :
                          isCorrect ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
                        }`}>
                          {selectedQuestionIdx + 1}
                        </div>
                        <div className="flex-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            isSkipped ? 'bg-slate-500/20 text-slate-400' :
                            isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {isSkipped ? 'NON RÉPONDU' : isCorrect ? 'CORRECT' : 'INCORRECT'}
                          </span>
                        </div>
                      </div>

                      {/* Question Image */}
                      {q.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-glass-border">
                          <img
                            src={getStorageUrl(q.imageUrl) || q.imageUrl}
                            alt="Question"
                            className="w-full h-auto max-h-[300px] object-contain bg-black/30"
                          />
                        </div>
                      )}

                      {/* Question Text */}
                      <p className="text-glass-text leading-relaxed text-lg">{q.text}</p>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options?.map((opt: string, optIdx: number) => {
                          const isUserChoice = userAnswer === optIdx;
                          const isCorrectOption = q.correctAnswer === optIdx;

                          let optClass = "w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ";

                          if (isCorrectOption) {
                            optClass += "bg-green-500/20 border-green-500/50 text-green-300";
                          } else if (isUserChoice && !isCorrectOption) {
                            optClass += "bg-red-500/20 border-red-500/50 text-red-300";
                          } else {
                            optClass += "bg-glass-100 border-glass-border text-slate-400";
                          }

                          return (
                            <div key={optIdx} className={optClass}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCorrectOption ? 'bg-green-500/30 border-2 border-green-500' :
                                isUserChoice ? 'bg-red-500/30 border-2 border-red-500' :
                                'bg-slate-700/50 border-2 border-slate-600'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span className="flex-1">{opt}</span>
                              {isCorrectOption && <Check size={18} className="text-green-400" />}
                              {isUserChoice && !isCorrectOption && <X size={18} className="text-red-400" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Writing/Speaking AI Feedback */}
      {result.feedback && (
        <div className="w-full mb-8">
          <div className="flex gap-4 mb-4">
            <Button 
                variant="secondary" 
                className="flex-1 flex justify-between items-center"
                onClick={() => setShowDetails(!showDetails)}
            >
                <span>Voir l'analyse IA détaillée</span>
                {showDetails ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
            </Button>
            
            {result.module === ModuleType.WRITING && (
                <Button 
                    variant="secondary" 
                    onClick={handleExportPDF} 
                    className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300"
                    title="Télécharger le rapport en PDF"
                >
                    <Download size={18} />
                    <span className="hidden sm:inline ml-2">PDF</span>
                </Button>
            )}
          </div>

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
        <Button onClick={() => navigate(ROUTES.DASHBOARD)} variant="secondary" icon={ArrowLeft}>
          Retour au Dashboard
        </Button>

        {hasQCMCorrection && (
          <Button onClick={() => navigate(ROUTES.CORRECTION)} variant="secondary" className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300" icon={Eye}>
            Voir la correction
          </Button>
        )}

        <Button onClick={() => navigate(ROUTES.DASHBOARD)} variant="primary" icon={RotateCcw}>
          Refaire un test
        </Button>
      </div>
    </div>
  );
};