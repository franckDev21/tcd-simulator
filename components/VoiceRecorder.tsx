import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from './GlassUI';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Impossible d'accéder au micro. Veuillez vérifier vos permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-glass-100 rounded-2xl border border-glass-border">
      {audioUrl ? (
        <div className="w-full max-w-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between bg-glass-200 p-4 rounded-xl">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                 <Mic size={20} />
               </div>
               <div>
                 <div className="font-medium text-sm">Enregistrement terminé</div>
                 <div className="text-xs text-slate-400">{formatTime(timer)}</div>
               </div>
             </div>
             <audio src={audioUrl} controls className="h-8 w-24" />
          </div>
          <div className="flex gap-3">
             <Button onClick={resetRecording} variant="secondary" className="flex-1" icon={RefreshCw}>Recommencer</Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-glass-200'}`}>
             {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-20 animate-ping"></div>
             )}
             <Mic size={40} className={isRecording ? 'text-red-500' : 'text-slate-400'} />
          </div>

          <div className="font-mono text-2xl font-bold tracking-wider">
            {formatTime(timer)}
          </div>

          <div className="flex gap-4 justify-center">
            {isRecording ? (
              <Button onClick={stopRecording} variant="danger" icon={Square}>Arrêter</Button>
            ) : (
              <Button onClick={startRecording} variant="primary" icon={Mic}>Commencer l'enregistrement</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};