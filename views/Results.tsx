import React, { useState, useEffect } from 'react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';
import { ChevronDown, ChevronUp, Eye, RotateCcw, ArrowLeft, Download } from 'lucide-react';
import { ProgressBar } from '../components/GlassUI';
import { ModuleType } from '../types';
import { jsPDF } from 'jspdf';

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
  // Principe: On compare le temps utilisé (timeSpent) au temps total (totalTime)
  //
  // Zones de performance:
  // - Excellent (90-100%): Le candidat a utilisé entre 70% et 95% du temps
  //   => Il a pris son temps mais pas trop, optimal pour la réflexion
  //
  // - Bien (70-89%): Le candidat a utilisé entre 50% et 70% OU entre 95% et 100%
  //   => Soit un peu rapide (peut améliorer la vérification)
  //   => Soit un peu serré (gérer mieux le rythme)
  //
  // - Moyen (40-69%): Le candidat a utilisé moins de 50% du temps
  //   => Trop rapide, risque de réponses précipitées
  //
  // - Insuffisant (<40%): Le candidat a utilisé plus de 100% (temps écoulé)
  //   => N'a pas pu finir dans les temps
  const calculateTimeManagement = () => {
    if (!result || !result.timeSpent || !result.totalTime || result.totalTime === 0) {
      return { value: 50, display: 'N/A', label: 'Non mesuré' };
    }

    const timeRatio = result.timeSpent / result.totalTime;

    // Cas 1: Temps optimal (70-95% du temps utilisé)
    // Le candidat a bien géré son temps avec marge pour vérifier
    if (timeRatio >= 0.70 && timeRatio <= 0.95) {
      const score = 90 + Math.round((1 - Math.abs(0.825 - timeRatio) / 0.125) * 10);
      return {
        value: Math.min(100, score),
        display: 'Excellent',
        label: 'Gestion optimale du temps'
      };
    }

    // Cas 2: Bien géré mais améliorable
    // Soit un peu rapide (50-70%), soit serré (95-100%)
    if ((timeRatio >= 0.50 && timeRatio < 0.70) || (timeRatio > 0.95 && timeRatio <= 1.0)) {
      const score = 70 + Math.round((timeRatio >= 0.50 && timeRatio < 0.70
        ? (timeRatio - 0.50) / 0.20
        : (1.0 - timeRatio) / 0.05) * 15);
      return {
        value: Math.min(89, Math.max(70, score)),
        display: 'Bien',
        label: timeRatio < 0.70 ? 'Un peu rapide' : 'Temps serré'
      };
    }

    // Cas 3: Trop rapide (moins de 50%)
    // Risque d'erreurs par précipitation
    if (timeRatio < 0.50) {
      const score = 40 + Math.round((timeRatio / 0.50) * 29);
      return {
        value: Math.max(40, score),
        display: 'Moyen',
        label: 'Réponses précipitées'
      };
    }

    // Cas 4: Temps dépassé (plus de 100%)
    // Le candidat n'a pas pu finir dans les temps
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