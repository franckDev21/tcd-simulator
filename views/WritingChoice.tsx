import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../components/GlassUI';
import { Bot, Download, ArrowLeft, FileText, Sparkles, Clock, Loader2, Lock } from 'lucide-react';
import { ROUTES } from '../router';
import { gradeWritingSubmission } from '../services/geminiService';
import { examService } from '../services/examService';
import { subscriptionService } from '../services/subscriptionService';
import { ModuleType, UserResult } from '../types';

interface WritingTask {
  question_id: number;
  task_number: number;
  subject: string;
  answer_text: string;
}

interface PendingWritingExam {
  seriesId: number;
  tasks: WritingTask[];
  questions: any[];
  timeSpent: number;
  totalTime: number;
}

export const WritingChoice: React.FC = () => {
  const navigate = useNavigate();
  const [examData, setExamData] = useState<PendingWritingExam | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAISubscription, setHasAISubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    // Load pending exam data
    const saved = localStorage.getItem('pendingWritingExam');
    if (saved) {
      setExamData(JSON.parse(saved));
    } else {
      navigate(ROUTES.DASHBOARD);
    }

    // Check AI subscription
    const checkAI = async () => {
      try {
        const status = await subscriptionService.getMySubscription();
        setHasAISubscription(status.has_ai_correction || false);
      } catch (error) {
        console.error('Failed to check AI subscription:', error);
      } finally {
        setCheckingSubscription(false);
      }
    };
    checkAI();
  }, [navigate]);

  const handleAICorrection = async () => {
    if (!examData) return;

    if (!hasAISubscription) {
      // Redirect to subscription page with AI upsell
      navigate(ROUTES.SUBSCRIPTION + '?ai=true');
      return;
    }

    setLoading(true);

    try {
      // Correct all tasks with AI
      const allFeedback: any[] = [];
      let totalScore = 0;

      for (const task of examData.tasks) {
        const result = await gradeWritingSubmission(task.subject, task.answer_text);
        allFeedback.push({
          task_number: task.task_number,
          subject: task.subject,
          answer: task.answer_text,
          ...result
        });
        totalScore += result.score;
      }

      // Average score
      const avgScore = Math.round(totalScore / examData.tasks.length);
      const level = getLevel(avgScore);

      // Save to backend
      await examService.submitAttempt({
        exam_series_id: examData.seriesId,
        score: avgScore,
        max_score: 699,
        level: level,
        time_spent: examData.timeSpent,
        feedback: allFeedback.map(f => f.feedback).join('\n\n---\n\n'),
        answers: examData.tasks.map(t => ({
          question_id: t.question_id,
          answer_text: t.answer_text
        }))
      });

      // Save to localStorage for results
      const examResult: UserResult = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        module: ModuleType.WRITING,
        score: avgScore,
        maxScore: 699,
        level: level,
        feedback: allFeedback.map(f => `**Tâche ${f.task_number}:**\n${f.feedback}`).join('\n\n'),
        correctionJson: { tasks: allFeedback },
        questions: examData.questions,
        userAnswers: examData.tasks.reduce((acc, t) => ({ ...acc, [t.question_id]: t.answer_text }), {}),
        timeSpent: examData.timeSpent,
        totalTime: examData.totalTime,
      };
      localStorage.setItem('lastExamResult', JSON.stringify(examResult));
      localStorage.removeItem('pendingWritingExam');

      navigate(ROUTES.RESULTS);
    } catch (error) {
      console.error('AI correction failed:', error);
      alert('Erreur lors de la correction IA. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!examData) return;

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expression Écrite - TCF</title>
        <style>
          body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
          h1 { text-align: center; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
          .task { margin: 30px 0; page-break-inside: avoid; }
          .task-header { background: #f0f4f8; padding: 15px; border-left: 4px solid #3b82f6; margin-bottom: 15px; }
          .task-number { font-weight: bold; color: #3b82f6; font-size: 1.2em; }
          .subject { font-style: italic; color: #475569; margin-top: 10px; }
          .answer { border: 1px solid #e2e8f0; padding: 20px; min-height: 200px; white-space: pre-wrap; background: #fafafa; }
          .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 0.9em; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .correction-zone { margin-top: 30px; border: 2px dashed #cbd5e1; padding: 20px; }
          .correction-zone h3 { color: #64748b; margin-top: 0; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>Expression Écrite - TCF</h1>
        <p style="text-align: center; color: #64748b;">Date: ${new Date().toLocaleDateString('fr-FR')}</p>

        ${examData.tasks.map((task: WritingTask) => `
          <div class="task">
            <div class="task-header">
              <div class="task-number">Tâche ${task.task_number}</div>
              <div class="subject"><strong>Sujet:</strong> ${task.subject}</div>
            </div>
            <div class="answer">${task.answer_text || '(Non répondu)'}</div>
            <div class="correction-zone">
              <h3>Zone de correction</h3>
              <p>Note: ___ / 20</p>
              <p>Observations:</p>
              <br><br><br>
            </div>
          </div>
        `).join('')}

        <div class="footer">
          <p>Document généré par PRIMO TCF - Préparation au TCF</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window and trigger print (which allows Save as PDF)
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(htmlContent);
      pdfWindow.document.close();
      // Auto-trigger print dialog so user can "Save as PDF"
      pdfWindow.onload = () => {
        pdfWindow.print();
      };
    }

    // Save attempt without AI correction
    saveWithoutCorrection();
  };

  const saveWithoutCorrection = async () => {
    if (!examData) return;

    try {
      await examService.submitAttempt({
        exam_series_id: examData.seriesId,
        score: 0, // No score without AI
        max_score: 699,
        level: 'N/A',
        time_spent: examData.timeSpent,
        feedback: 'Correction manuelle (impression)',
        answers: examData.tasks.map(t => ({
          question_id: t.question_id,
          answer_text: t.answer_text
        }))
      });

      localStorage.removeItem('pendingWritingExam');
    } catch (error) {
      console.error('Failed to save attempt:', error);
    }
  };

  const getLevel = (score: number) => {
    if (score < 100) return 'A1';
    if (score < 200) return 'A2';
    if (score < 300) return 'B1';
    if (score < 400) return 'B2';
    if (score < 500) return 'C1';
    return 'C2';
  };

  if (!examData || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft size={16} className="mr-2" /> Retour
        </Button>
        <h1 className="text-3xl font-bold mb-2">Épreuve Terminée !</h1>
        <p className="text-slate-400">
          Vous avez complété {examData.tasks.filter(t => t.answer_text.trim()).length} / {examData.tasks.length} tâches
        </p>
      </div>

      {/* Tasks Summary */}
      <GlassCard>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FileText size={18} className="text-blue-400" />
          Récapitulatif de vos réponses
        </h3>
        <div className="space-y-3">
          {examData.tasks.map((task) => (
            <div key={task.task_number} className="flex items-center gap-4 p-3 bg-glass-200 rounded-xl border border-glass-border">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                task.answer_text.trim() ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {task.task_number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Tâche {task.task_number}</p>
                <p className="text-xs text-slate-500">
                  {task.answer_text.trim()
                    ? `${task.answer_text.split(/\s+/).length} mots`
                    : 'Non répondu'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Choice Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Correction */}
        <GlassCard
          className={`relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:border-blue-500/50 ${
            loading ? 'pointer-events-none opacity-70' : ''
          }`}
          onClick={handleAICorrection}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Bot size={32} className="text-white" />
            </div>

            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              Correction IA
              <Sparkles size={16} className="text-yellow-400" />
            </h3>

            <p className="text-slate-400 text-sm mb-4">
              Obtenez une correction instantanée avec feedback détaillé, score et conseils personnalisés.
            </p>

            <div className="flex items-center gap-2 text-sm text-emerald-400 mb-4">
              <Clock size={14} />
              <span>Résultat en quelques secondes</span>
            </div>

            {!hasAISubscription && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                <Lock size={14} />
                <span>Nécessite l'abonnement IA</span>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <Loader2 className="animate-spin text-blue-400 mx-auto mb-2" size={32} />
                  <p className="text-sm text-slate-300">Correction en cours...</p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Download PDF */}
        <GlassCard
          className="relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:border-emerald-500/50"
          onClick={handleDownloadPDF}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
              <Download size={32} className="text-white" />
            </div>

            <h3 className="text-xl font-bold mb-2">Télécharger le PDF</h3>

            <p className="text-slate-400 text-sm mb-4">
              Téléchargez votre devoir en PDF pour le faire corriger par un professeur ou formateur.
            </p>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FileText size={14} />
              <span>Format PDF avec zone de correction</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-slate-500">
        <p>Vos réponses sont automatiquement sauvegardées.</p>
      </div>
    </div>
  );
};
