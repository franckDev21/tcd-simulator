import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModuleType, Question, CorrectionResult, UserResult } from '../types';
import { GlassCard, Button, ProgressBar } from '../components/GlassUI';
import { Timer, Volume2, Flag, ChevronLeft, ChevronRight, Check, Loader } from 'lucide-react';
import { gradeWritingSubmission } from '../services/geminiService';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useAppStore } from '../store/useAppStore';
import { examService, ApiQuestion } from '../services/examService';
import { flaggedQuestionsService } from '../services/flaggedQuestionsService';
import { getStorageUrl } from '../services/api';
import { ROUTES } from '../router';

// Map URL code to ModuleType
const codeToModule: Record<string, ModuleType> = {
  'CE': ModuleType.READING,
  'CO': ModuleType.LISTENING,
  'EE': ModuleType.WRITING,
  'EO': ModuleType.SPEAKING,
};

export const ExamRunner: React.FC = () => {
    const navigate = useNavigate();
    const { module, seriesId } = useParams<{ module: string; seriesId: string }>();
    const moduleCode = decodeURIComponent(module || 'CE');
    const activeSeriesId = seriesId ? parseInt(seriesId, 10) : null;
    const activeModule = codeToModule[moduleCode] || ModuleType.READING;

    // Data State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loadingExam, setLoadingExam] = useState(true);
    const [initialTime, setInitialTime] = useState(60 * 60);

    // Exam State
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [flagged, setFlagged] = useState<Record<number, boolean>>({});
    const [timeLeft, setTimeLeft] = useState(60 * 60);
    const [loadingCorrection, setLoadingCorrection] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [correctionResult, setCorrectionResult] = useState<CorrectionResult | null>(null);

    // Ref to track time spent
    const startTimeRef = useRef<number>(Date.now());

    // Initial Load
    useEffect(() => {
        const loadExam = async () => {
            if (!activeSeriesId) {
                setLoadingExam(false);
                return;
            }
            try {
                setLoadingExam(true);
                const data = await examService.getExam(activeSeriesId);

                // Map API questions to UI questions
                const mappedQuestions: Question[] = data.questions.map((q: ApiQuestion) => ({
                    id: q.id,
                    text: q.text,
                    options: q.choices || [],
                    correctAnswer: q.correct_answer || 0,
                    audioUrl: getStorageUrl(q.audio_url) || undefined,
                    imageUrl: getStorageUrl(q.image_url) || undefined,
                    points: q.points
                }));

                setQuestions(mappedQuestions);

                // Set timer based on module
                const time = (data.module_type === 'CE' || data.module_type === 'EE') ? 60 * 60 : 40 * 60;
                setTimeLeft(time);
                setInitialTime(time);
                startTimeRef.current = Date.now();

            } catch (error) {
                console.error("Failed to load exam", error);
                alert("Erreur lors du chargement de l'examen.");
                navigate(ROUTES.DASHBOARD);
            } finally {
                setLoadingExam(false);
            }
        };

        loadExam();
    }, [activeSeriesId, navigate]);

    // Timer
    useEffect(() => {
        if (isFinished || loadingExam || questions.length === 0) return;
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
    }, [isFinished, loadingExam, questions.length]);

    // Calculate time spent in seconds
    const getTimeSpent = () => {
        return Math.floor((Date.now() - startTimeRef.current) / 1000);
    };

    const handleFinish = async () => {
        setIsFinished(true);
        if (!activeSeriesId || !activeModule) return;

        const timeSpent = getTimeSpent();

        // --- WRITING MODULE ---
        if (activeModule === ModuleType.WRITING) {
            // Collect all tasks answers
            const tasksAnswers = questions.map((q, idx) => ({
                question_id: q.id,
                task_number: idx + 1,
                subject: q.text,
                answer_text: answers[q.id] || ''
            }));

            // Save to localStorage for the choice page
            const writingData = {
                seriesId: activeSeriesId,
                tasks: tasksAnswers,
                questions: questions,
                timeSpent: timeSpent,
                totalTime: initialTime,
            };
            localStorage.setItem('pendingWritingExam', JSON.stringify(writingData));

            // Navigate to choice page (correction IA ou impression)
            navigate(ROUTES.WRITING_CHOICE);
            return;
        }

        // --- QCM MODULES (READING / LISTENING) ---
        else {
            setLoadingCorrection(true);
            let score = 0;
            let maxScore = 0;
            let correctCount = 0;
            const answersPayload: any[] = [];

            questions.forEach(q => {
                maxScore += q.points;
                const isCorrect = answers[q.id] === q.correctAnswer;
                if (isCorrect) {
                    score += q.points;
                    correctCount++;
                }

                answersPayload.push({
                    question_id: q.id,
                    selected_choice_index: answers[q.id],
                    is_correct: isCorrect
                });
            });

            const normalizedScore = Math.round((score / maxScore) * 699);
            const level = getLevel(normalizedScore);

            try {
                // Save to Backend
                await examService.submitAttempt({
                    exam_series_id: activeSeriesId,
                    score: normalizedScore,
                    max_score: 699,
                    level: level,
                    time_spent: timeSpent,
                    answers: answersPayload
                });

                // Local Storage for Results View
                const examResult: UserResult = {
                    id: Date.now().toString(),
                    date: new Date().toISOString().split('T')[0],
                    module: activeModule,
                    score: normalizedScore,
                    maxScore: 699,
                    level: level,
                    questions: questions,
                    userAnswers: answers,
                    correctCount: correctCount,
                    totalQuestions: questions.length,
                    timeSpent: timeSpent,
                    totalTime: initialTime,
                };
                localStorage.setItem('lastExamResult', JSON.stringify(examResult));

                // Save flagged questions to localStorage for Results page
                localStorage.setItem('lastExamFlagged', JSON.stringify(flagged));

                // Send flagged questions to API
                const flaggedQuestionIds = Object.keys(flagged).filter(k => flagged[parseInt(k)]);
                if (flaggedQuestionIds.length > 0) {
                    try {
                        await flaggedQuestionsService.flag(
                            flaggedQuestionIds.map(id => ({
                                question_id: parseInt(id),
                                reason: 'review' as const
                            }))
                        );
                    } catch (flagError) {
                        console.error("Failed to save flagged questions:", flagError);
                    }
                }
            } catch (e) {
                console.error("Submit failed", e);
            } finally {
                setLoadingCorrection(false);
                navigate(ROUTES.RESULTS);
            }
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

    const getWordCount = (text: string) => {
        if (!text || text.trim() === '') return 0;
        return text.trim().split(/\s+/).length;
    };

    if (loadingExam) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader className="animate-spin text-blue-500 mb-4" size={48} />
                <p className="text-slate-400">Chargement de l'examen...</p>
            </div>
        );
    }

    if (loadingCorrection) {
        return (
            <div className="h-[80vh] flex items-center justify-center flex-col animate-fade-in">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold">Traitement en cours...</h2>
                <p className="text-slate-500 mt-2">Enregistrement de vos résultats.</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return <div className="p-8 text-center text-slate-500">Aucune question chargée.</div>;
    }

    const currentQ = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    const answeredCount = Object.keys(answers).length;
    const flaggedCount = Object.keys(flagged).filter(k => flagged[Number(k)]).length;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col min-h-[calc(100vh-64px)]">
            {/* Progress Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-400">PROGRESSION: {Math.round((answeredCount / questions.length) * 100)}%</span>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-sm transition-colors ${timeLeft < 300 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-glass-100 border-glass-border text-blue-400'}`}>
                        <Timer size={14} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
                <ProgressBar value={answeredCount} max={questions.length} />
            </div>

            {/* Question Navigator - Different for Writing module */}
            {activeModule === ModuleType.WRITING ? (
                /* Writing Module: Show 3 Task buttons side by side */
                <div className="mb-6 animate-fade-in">
                    <GlassCard className="p-4">
                        <div className="flex gap-3 justify-center">
                            {questions.map((q, idx) => {
                                const isAnswered = answers[q.id] && String(answers[q.id]).trim().length > 0;
                                const isCurrent = idx === currentIdx;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIdx(idx)}
                                        className={`flex-1 max-w-[200px] py-4 px-6 rounded-xl text-base font-semibold transition-all duration-200 border-2 flex items-center justify-center gap-2 ${
                                            isCurrent
                                                ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/30 scale-105'
                                                : isAnswered
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30'
                                                : 'bg-glass-200 text-slate-400 border-glass-border hover:border-slate-500 hover:bg-glass-300'
                                        }`}
                                    >
                                        Tâche {idx + 1}
                                        {isAnswered && !isCurrent && <Check size={16} />}
                                    </button>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>
            ) : (
                /* QCM Modules: Show numbered question navigator with legend */
                <div className="mb-6 animate-fade-in">
                    <GlassCard className="p-4">
                        <div className="flex flex-wrap gap-2 mb-4 justify-start content-start">
                            {questions.map((q, idx) => {
                                const isAnswered = answers[q.id] !== undefined;
                                const isCurrent = idx === currentIdx;
                                const isFlagged = flagged[q.id];

                                let btnClass = "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 border-2 ";

                                if (isCurrent) {
                                    btnClass += "bg-white text-slate-900 border-blue-500 ring-2 ring-blue-500/30 scale-105 shadow-lg font-bold";
                                } else if (isFlagged) {
                                    btnClass += "bg-yellow-400 text-yellow-900 border-yellow-500";
                                } else if (isAnswered) {
                                    btnClass += "bg-slate-700 text-white border-slate-600";
                                } else {
                                    btnClass += "bg-transparent text-slate-400 border-slate-600 hover:bg-slate-800";
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
                        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-glass-border text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-transparent border-2 border-slate-600"></span>
                                <span>Actuel</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-500"></span>
                                <span>Révision</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-600"></span>
                                <span>Répondu</span>
                            </div>
                            {flaggedCount > 0 && (
                                <span className="ml-auto text-yellow-400">{flaggedCount} marquée(s) pour révision</span>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Main Question Card */}
            <GlassCard className="flex-1 flex flex-col relative">
                {activeModule === ModuleType.READING || activeModule === ModuleType.LISTENING ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 pb-24 overflow-y-auto">
                            {/* Question Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30">
                                    <span className="text-blue-400 text-sm font-bold">Question {currentIdx + 1}</span>
                                </div>
                                <button
                                    onClick={() => toggleFlag(currentQ.id)}
                                    className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-colors border ${
                                        flagged[currentQ.id]
                                            ? 'bg-yellow-400/20 text-yellow-400 border-yellow-500/50'
                                            : 'text-slate-400 hover:text-white border-slate-600 hover:border-slate-500 hover:bg-white/5'
                                    }`}
                                >
                                    <Flag size={14} fill={flagged[currentQ.id] ? "currentColor" : "none"} />
                                    Marquer
                                </button>
                            </div>

                            {/* Media Section */}
                            {currentQ.imageUrl && (
                                <div className="mb-6">
                                    <img
                                        src={currentQ.imageUrl}
                                        alt="Document"
                                        className="w-full h-auto max-h-[400px] object-contain rounded-xl border border-glass-border bg-black/30"
                                    />
                                </div>
                            )}

                            {currentQ.audioUrl && (
                                <div className="bg-glass-200 p-4 rounded-xl flex items-center gap-4 mb-6 border border-glass-border">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                        <Volume2 size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <audio controls src={currentQ.audioUrl} className="w-full h-10" />
                                    </div>
                                </div>
                            )}

                            {/* Question Text */}
                            <h3 className="text-xl md:text-2xl font-medium mb-8 leading-relaxed text-glass-text">
                                {currentQ.text}
                            </h3>

                            {/* Options */}
                            <div className="space-y-3">
                                {currentQ.options?.map((opt, idx) => {
                                    const isSelected = answers[currentQ.id] === idx;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setAnswers({ ...answers, [currentQ.id]: idx })}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${
                                                isSelected
                                                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-glass-200 border-glass-border hover:border-slate-500 hover:bg-glass-300 text-slate-300'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 shrink-0 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                                                isSelected
                                                    ? 'bg-white text-blue-600 border-white'
                                                    : 'border-slate-500 text-slate-400 group-hover:border-slate-400 group-hover:text-slate-300'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="text-base md:text-lg">{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-glass-bg/95 backdrop-blur-xl border-t border-glass-border flex justify-between items-center z-10 rounded-b-2xl">
                            <Button
                                variant="ghost"
                                disabled={currentIdx === 0}
                                onClick={() => setCurrentIdx(prev => prev - 1)}
                                className="px-4"
                            >
                                <ChevronLeft size={18} className="mr-1" /> Précédent
                            </Button>

                            <span className="text-sm text-slate-500 hidden sm:block">
                                {currentIdx + 1} / {questions.length}
                            </span>

                            {isLast ? (
                                <Button onClick={handleFinish} variant="primary" icon={Check}>
                                    Terminer le test
                                </Button>
                            ) : (
                                <Button onClick={() => setCurrentIdx(prev => prev + 1)} variant="secondary">
                                    Suivant <ChevronRight size={18} className="ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : activeModule === ModuleType.WRITING ? (
                    <div className="flex flex-col h-full">
                        {/* Current Task */}
                        <div className="flex-1 flex flex-col min-h-[400px]">
                            {/* Task Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                                    <span className="text-indigo-400 text-sm font-bold">Tâche {currentIdx + 1} / {questions.length}</span>
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="mb-4 bg-gradient-to-r from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-600/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">Sujet</span>
                                </div>
                                <p className="text-slate-200 leading-relaxed">{currentQ.text}</p>
                            </div>

                            {/* Text Area */}
                            <textarea
                                className="flex-1 w-full bg-glass-200 border border-glass-border rounded-xl p-4 text-glass-text outline-none focus:border-blue-500/50 resize-none font-sans leading-relaxed transition-all focus:bg-glass-300 min-h-[250px]"
                                placeholder="Rédigez votre réponse ici..."
                                value={answers[currentQ.id] || ''}
                                onChange={(e) => setAnswers({...answers, [currentQ.id]: e.target.value})}
                            />

                            {/* Footer */}
                            <div className="mt-4 flex justify-between items-center">
                                <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg text-sm">
                                    {getWordCount(answers[currentQ.id] || '')} mots
                                </span>
                                <div className="flex gap-3">
                                    {currentIdx > 0 && (
                                        <Button variant="ghost" onClick={() => setCurrentIdx(prev => prev - 1)}>
                                            <ChevronLeft size={16} className="mr-1" /> Tâche précédente
                                        </Button>
                                    )}
                                    {currentIdx < questions.length - 1 ? (
                                        <Button variant="secondary" onClick={() => setCurrentIdx(prev => prev + 1)}>
                                            Tâche suivante <ChevronRight size={16} className="ml-1" />
                                        </Button>
                                    ) : (
                                        <Button onClick={handleFinish} loading={loadingCorrection} variant="primary" icon={Check}>
                                            Terminer l'épreuve
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col py-8">
                        {/* Question Card */}
                        <div className="mb-8 animate-fade-in">
                            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-600/30 p-6 max-w-2xl mx-auto">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                                        <span className="text-rose-400 font-bold">Q</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Sujet de l'épreuve</h3>
                                </div>
                                <p className="text-slate-300 leading-relaxed">{currentQ.text}</p>
                                <p className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-700/50">
                                    💡 Prenez le temps de préparer votre réponse, puis enregistrez-vous.
                                </p>
                            </div>
                        </div>

                        {/* Voice Recorder */}
                        <div className="flex-1 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <VoiceRecorder onRecordingComplete={(url) => setAnswers({...answers, [currentQ.id]: url})} />
                        </div>

                        {/* Submit Button */}
                        {answers[currentQ.id] && (
                            <div className="flex justify-center mt-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                <Button
                                    onClick={handleFinish}
                                    variant="primary"
                                    className="px-10 py-4 text-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 shadow-lg shadow-rose-500/30"
                                >
                                    Terminer l'épreuve
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
