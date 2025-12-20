import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './GlassUI';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
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
      setPermissionDenied(false);
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
      setPermissionDenied(true);
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

  // COMPLETED STATE
  if (audioUrl) {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-6 shadow-xl shadow-emerald-500/10">
          {/* Success Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg text-white">Enregistrement terminé</h3>
              <p className="text-sm text-slate-400">Durée: {formatTime(timer)}</p>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700/50">
            <audio src={audioUrl} controls className="w-full h-10" />
          </div>

          {/* Actions */}
          <Button
            onClick={resetRecording}
            variant="secondary"
            className="w-full"
            icon={RefreshCw}
          >
            Recommencer l'enregistrement
          </Button>
        </div>
      </div>
    );
  }

  // PERMISSION DENIED STATE
  if (permissionDenied) {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <div className="bg-gradient-to-br from-red-900/30 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Accès au microphone refusé</h3>
          <p className="text-sm text-slate-400 mb-6">
            Veuillez autoriser l'accès au microphone dans les paramètres de votre navigateur.
          </p>
          <Button onClick={startRecording} variant="secondary">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // RECORDING / IDLE STATE
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className={`
        bg-gradient-to-br backdrop-blur-xl rounded-2xl border p-8 text-center transition-all duration-500
        ${isRecording 
          ? 'from-red-900/40 to-slate-900/80 border-red-500/40 shadow-xl shadow-red-500/20' 
          : 'from-slate-800/80 to-slate-900/80 border-slate-600/30'
        }
      `}>
        {/* Microphone Icon with Animation */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Outer pulse rings when recording */}
          {isRecording && (
            <>
              <div className="absolute w-32 h-32 rounded-full border-2 border-red-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute w-28 h-28 rounded-full border border-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            </>
          )}
          
          {/* Main microphone button */}
          <div className={`
            relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 z-10
            ${isRecording 
              ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50' 
              : 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50'
            }
          `}>
            <Mic size={40} className={isRecording ? 'text-white' : 'text-slate-400'} />
          </div>
        </div>

        {/* Timer Display */}
        <div className={`
          font-mono text-4xl font-bold tracking-widest mb-8 transition-colors duration-300
          ${isRecording ? 'text-red-400' : 'text-slate-400'}
        `}>
          {formatTime(timer)}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          {isRecording ? (
            <Button
              onClick={stopRecording}
              variant="danger"
              className="px-8 py-3 text-base shadow-lg shadow-red-500/30"
              icon={Square}
            >
              Arrêter l'enregistrement
            </Button>
          ) : (
            <Button
              onClick={startRecording}
              variant="primary"
              className="px-8 py-3 text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-lg shadow-blue-500/30"
              icon={Mic}
            >
              Commencer l'enregistrement
            </Button>
          )}
        </div>

        {/* Helper Text */}
        {!isRecording && (
          <p className="mt-6 text-sm text-slate-500">
            Cliquez pour démarrer l'enregistrement
          </p>
        )}
        {isRecording && (
          <p className="mt-6 text-sm text-red-400/80 animate-pulse">
            Enregistrement en cours...
          </p>
        )}
      </div>
    </div>
  );
};