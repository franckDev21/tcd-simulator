import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';

interface VerifyEmailProps {
  token: string;
  onComplete: () => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ token, onComplete }) => {
  const { verifyEmail } = useAuthStore();
  const { toggleAuthModal } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const response = await verifyEmail(token);
        setMessage(response);
        setStatus('success');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Erreur de vérification');
        setStatus('error');
      }
    };

    if (token) {
      verify();
    }
  }, [token]);

  const handleLogin = () => {
    onComplete();
    toggleAuthModal(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 size={48} className="text-blue-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold mb-2">Vérification en cours...</h2>
            <p className="text-slate-400">Veuillez patienter pendant que nous vérifions votre email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Email vérifié !</h2>
            <p className="text-slate-400 mb-6">{message}</p>
            <Button onClick={handleLogin} className="w-full">
              Se connecter
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <XCircle size={48} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Erreur de vérification</h2>
            <p className="text-slate-400 mb-6">{message}</p>
            <Button onClick={onComplete} variant="secondary" className="w-full">
              Retour à l'accueil
            </Button>
          </>
        )}
      </GlassCard>
    </div>
  );
};
