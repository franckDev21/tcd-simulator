import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../router';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuthStore();
  const { toggleAuthModal } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  // Get token from URL query params
  const token = searchParams.get('token') || '';

  useEffect(() => {
    const verify = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      if (!token) {
        setMessage('Token de vérification manquant');
        setStatus('error');
        return;
      }

      try {
        const response = await verifyEmail(token);
        setMessage(response);
        setStatus('success');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Erreur de vérification');
        setStatus('error');
      }
    };

    verify();
  }, [token, verifyEmail]);

  const handleLogin = () => {
    navigate(ROUTES.HOME);
    toggleAuthModal(true);
  };

  const handleBackHome = () => {
    navigate(ROUTES.HOME);
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
            <Button onClick={handleBackHome} variant="secondary" className="w-full">
              Retour à l'accueil
            </Button>
          </>
        )}
      </GlassCard>
    </div>
  );
};
