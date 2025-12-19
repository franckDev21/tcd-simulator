import React, { useState } from 'react';
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAuthStore } from '../store/useAuthStore';

interface CheckEmailProps {
  email: string;
  onBack: () => void;
}

export const CheckEmail: React.FC<CheckEmailProps> = ({ email, onBack }) => {
  const { resendVerification, isLoading } = useAuthStore();
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const handleResend = async () => {
    setResendSuccess(false);
    setResendError('');
    try {
      await resendVerification();
      setResendSuccess(true);
    } catch (error) {
      setResendError(error instanceof Error ? error.message : 'Erreur lors de l\'envoi');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md text-center">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Retour</span>
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Mail size={40} className="text-blue-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Vérifiez vos emails</h2>

        <p className="text-slate-400 mb-2">
          Nous avons envoyé un lien de vérification à :
        </p>

        <p className="text-blue-400 font-medium mb-6">
          {email}
        </p>

        <p className="text-slate-500 text-sm mb-6">
          Cliquez sur le lien dans l'email pour activer votre compte.
          Si vous ne trouvez pas l'email, vérifiez votre dossier spam.
        </p>

        {resendSuccess && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center justify-center gap-2 text-green-400 text-sm">
            <CheckCircle size={16} />
            <span>Email renvoyé avec succès !</span>
          </div>
        )}

        {resendError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {resendError}
          </div>
        )}

        <Button
          onClick={handleResend}
          variant="secondary"
          className="w-full"
          loading={isLoading}
        >
          <RefreshCw size={16} />
          Renvoyer l'email
        </Button>

        <div className="mt-6 pt-6 border-t border-glass-border">
          <p className="text-slate-500 text-xs">
            L'email peut prendre quelques minutes à arriver.
            <br />
            Le lien expire dans 24 heures.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
