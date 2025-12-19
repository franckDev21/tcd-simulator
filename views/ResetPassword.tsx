import React, { useState } from 'react';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';

interface ResetPasswordProps {
  token: string;
  email: string;
  onComplete: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ token, email, onComplete }) => {
  const { resetPassword, isLoading, error } = useAuthStore();
  const { toggleAuthModal } = useAppStore();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    setLocalError('');

    if (!password) {
      setLocalError('Le mot de passe est requis');
      return false;
    }

    if (password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (password !== passwordConfirm) {
      setLocalError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await resetPassword(token, email, password);
      setSuccess(true);
    } catch {
      // Error handled by store
    }
  };

  const handleLogin = () => {
    onComplete();
    toggleAuthModal(true);
  };

  const displayError = localError || error;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Mot de passe réinitialisé !</h2>
          <p className="text-slate-400 mb-6">
            Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
          </p>
          <Button onClick={handleLogin} className="w-full">
            Se connecter
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md">
        <button
          onClick={onComplete}
          className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Retour</span>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Nouveau mot de passe</h2>

        {displayError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" loading={isLoading}>
            Réinitialiser le mot de passe
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};
