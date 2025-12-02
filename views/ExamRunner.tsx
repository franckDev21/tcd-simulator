
import React, { useState, useEffect, useRef } from 'react';
import { ModuleType, Question, CorrectionResult, UserResult } from '../types';
import { GlassCard, Button, ProgressBar } from '../components/GlassUI';
import { Timer, Volume2, Flag, ChevronLeft, ChevronRight, Check, Download, Bold, Italic, Underline, List, Heading1, Quote, Eraser } from 'lucide-react';
import { gradeWritingSubmission } from '../services/geminiService';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useAppStore } from '../store/useAppStore';
import { jsPDF } from 'jspdf';

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
  
  // Ref for Textarea to handle cursor position
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleDownloadPDF = () => {
    const text = answers[currentQ.id] || "";
    if (!text.trim()) {
        alert("Veuillez écrire du texte avant de télécharger.");
        return;
    }
    
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // --- Helper Functions for Markdown Rendering ---
    
    const checkPageBreak = (heightNeeded: number) => {
      if (yPos + heightNeeded > 280) {
        doc.addPage();
        yPos = 20;
      }
    };

    const renderHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo/Primary
        doc.text("Expression Écrite - Copie Officielle", margin, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Généré le " + new Date().toLocaleDateString("fr-FR"), margin, yPos);
        yPos += 20;
    };

    const renderSubject = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Sujet", margin, yPos);
        yPos += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(60);
        const splitQuestion = doc.splitTextToSize(currentQ.text, maxLineWidth);
        doc.text(splitQuestion, margin, yPos);
        yPos += splitQuestion.length * 6 + 15;
    };

    // --- Main Rendering Logic ---
    
    renderHeader();
    renderSubject();

    // Section Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Votre Rédaction", margin, yPos);
    yPos += 10;

    // Reset Font for Body
    doc.setFontSize(11);
    doc.setTextColor(0);

    const lines = text.split('\n');
    const lineHeight = 6;

    lines.forEach((line) => {
        // Reset styles for each line
        let fontSize = 11;
        let fontStyle = "normal";
        let xOffset = margin;
        let textColor = [0, 0, 0]; // Black
        let cleanLine = line;
        
        // 1. Check for Block Styles (Heading, List, Quote)
        if (line.startsWith('# ')) {
            fontSize = 16;
            fontStyle = "bold";
            cleanLine = line.substring(2);
            yPos += 4; // Extra space before heading
        } else if (line.startsWith('- ')) {
            xOffset = margin + 5;
            cleanLine = line.substring(2);
            // Draw bullet
            doc.setFontSize(14);
            doc.text("•", margin, yPos); 
        } else if (line.startsWith('> ')) {
            fontStyle = "italic";
            textColor = [100, 116, 139]; // Slate 500
            xOffset = margin + 10;
            cleanLine = line.substring(2);
            // Draw bar
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(1);
            doc.line(margin + 2, yPos - 4, margin + 2, yPos + 2);
        }

        // Apply Block Styles
        doc.setFontSize(fontSize);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);

        // 2. Handle Inline Styles (Bold) and Line Wrapping
        // We split by ** to find bold segments
        // Note: Simple parser, assumes matching ** pairs.
        
        const segments = cleanLine.split(/(\*\*.*?\*\*)/g);
        let currentX = xOffset;
        
        // Calculate max width for this specific line type
        const currentMaxWidth = maxLineWidth - (xOffset - margin);

        // We need to buffer words and print them to handle wrapping with mixed styles
        let lineBuffer: {text: string, style: string, width: number}[] = [];
        let currentLineWidth = 0;

        segments.forEach(segment => {
            let isBold = false;
            let content = segment;
            
            if (segment.startsWith('**') && segment.endsWith('**')) {
                isBold = true;
                content = segment.substring(2, segment.length - 2);
            }

            // If line style is already bold (Header), force bold. 
            // If line style is italic (Quote), use bolditalic if available or just bold.
            // jspdf standard fonts: normal, bold, italic, bolditalic
            
            let segmentStyle = fontStyle;
            if (isBold) {
                 if (fontStyle === "normal") segmentStyle = "bold";
                 else if (fontStyle === "italic") segmentStyle = "bolditalic";
                 // if already bold, stay bold
            }

            // Split into words to handle wrapping
            const words = content.split(' ');
            
            words.forEach((word, wIdx) => {
                // Add space after word unless it's the last word of segment AND not the last segment
                // Simplification: always add space, trim later?
                // Better: join with space when printing.
                
                const wordWithSpace = word + (wIdx < words.length - 1 ? " " : ""); 
                
                // Measure word
                doc.setFont("helvetica", segmentStyle);
                const wordWidth = doc.getTextWidth(wordWithSpace);

                // Check wrap
                if (currentLineWidth + wordWidth > currentMaxWidth) {
                    // FLUSH BUFFER TO PDF
                    checkPageBreak(lineHeight);
                    
                    let printX = xOffset;
                    lineBuffer.forEach(item => {
                        doc.setFont("helvetica", item.style);
                        doc.text(item.text, printX, yPos);
                        printX += item.width;
                    });

                    // New Line
                    yPos += lineHeight;
                    lineBuffer = [];
                    currentLineWidth = 0;
                    
                    // Add current word to new line
                    // If word starts with space (from split), trim it for start of line?
                    // The split(' ') removes spaces, so word is clean.
                    
                    lineBuffer.push({ text: wordWithSpace, style: segmentStyle, width: wordWidth });
                    currentLineWidth += wordWidth;

                } else {
                    lineBuffer.push({ text: wordWithSpace, style: segmentStyle, width: wordWidth });
                    currentLineWidth += wordWidth;
                }
            });
            
            // Add a space after the segment if it wasn't the last one
            // This is tricky with split. Simple split by ** preserves boundary.
            // We assume segments might need spacing.
        });

        // Flush remaining buffer (Final line of the paragraph)
        if (lineBuffer.length > 0) {
            checkPageBreak(lineHeight);
            let printX = xOffset;
            lineBuffer.forEach(item => {
                doc.setFont("helvetica", item.style);
                doc.text(item.text, printX, yPos);
                printX += item.width;
            });
            yPos += lineHeight;
        }

        // Add extra spacing after paragraph if it was a newline
        // If the original line was empty, just add spacing
        if (lines.length > 1) {
            yPos += 2; 
        }
    });

    doc.save(`Expression_Ecrite_${new Date().getTime()}.pdf`);
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

  // --- TEXT FORMATTING LOGIC ---
  const handleFormat = (type: 'bold' | 'italic' | 'underline' | 'list' | 'h1' | 'quote') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = answers[currentQ.id] || '';
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = text;
    let newCursorPos = end;

    switch (type) {
      case 'bold':
        newText = `${before}**${selection}**${after}`;
        newCursorPos = end + 4;
        break;
      case 'italic':
        newText = `${before}*${selection}*${after}`;
        newCursorPos = end + 2;
        break;
      case 'underline':
        // Markdown doesn't standardly support underline, using __ as a common substitute or visually distinct marker
        newText = `${before}__${selection}__${after}`;
        newCursorPos = end + 4;
        break;
      case 'list':
        newText = `${before}\n- ${selection}${after}`;
        newCursorPos = end + 3;
        break;
      case 'h1':
        newText = `${before}\n# ${selection}${after}`;
        newCursorPos = end + 3;
        break;
      case 'quote':
        newText = `${before}\n> ${selection}${after}`;
        newCursorPos = end + 3;
        break;
    }

    setAnswers({...answers, [currentQ.id]: newText});
    
    // Restore focus and update cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
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
            
            {/* Rich Text Editor Container */}
            <div className="flex-1 flex flex-col bg-glass-100 border border-glass-border rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
              
              {/* Toolbar */}
              <div className="bg-glass-200 border-b border-glass-border p-2 flex items-center gap-1 overflow-x-auto">
                 <button onClick={() => handleFormat('bold')} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Gras">
                    <Bold size={16} />
                 </button>
                 <button onClick={() => handleFormat('italic')} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Italique">
                    <Italic size={16} />
                 </button>
                 <button onClick={() => handleFormat('underline')} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Souligner">
                    <Underline size={16} />
                 </button>
                 <div className="w-px h-6 bg-glass-border mx-1"></div>
                 <button onClick={() => handleFormat('h1')} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Titre">
                    <Heading1 size={16} />
                 </button>
                 <button onClick={() => handleFormat('list')} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Liste">
                    <List size={16} />
                 </button>
                 <button onClick={() => handleFormat('quote')} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Citation">
                    <Quote size={16} />
                 </button>
                 <div className="flex-1"></div>
                 <button 
                  onClick={() => setAnswers({...answers, [currentQ.id]: ''})}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors" 
                  title="Effacer tout"
                 >
                    <Eraser size={16} />
                 </button>
              </div>

              {/* Text Area */}
              <textarea
                ref={textareaRef}
                className="flex-1 w-full bg-transparent p-4 text-glass-text outline-none resize-none font-sans leading-relaxed min-h-[400px]"
                placeholder="Écrivez votre réponse ici..."
                value={answers[currentQ.id] || ''}
                onChange={(e) => setAnswers({...answers, [currentQ.id]: e.target.value})}
              />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500 gap-4">
              <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded">
                {getWordCount(answers[currentQ.id] || '')} mots
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                 <Button variant="secondary" onClick={handleDownloadPDF} icon={Download} className="flex-1 sm:flex-none">
                    Télécharger
                 </Button>
                 <Button onClick={handleFinish} loading={loadingCorrection} className="flex-1 sm:flex-none">
                    Soumettre pour correction
                 </Button>
              </div>
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
