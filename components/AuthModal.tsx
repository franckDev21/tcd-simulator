import React, { useState } from 'react';
import { X, Mail, User as UserIcon, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { GlassCard, Button } from './GlassUI';
import { PhoneInput } from './PhoneInput';
import { PasswordInput } from './PasswordInput';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import type { AuthModalMode } from '../types/auth';

export const AuthModal: React.FC = () => {
  const { toggleAuthModal, login: appLogin, showCheckEmail } = useAppStore();
  const { login, register, forgotPassword, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<AuthModalMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setPasswordConfirm('');
    setSuccessMessage('');
    setLocalError('');
    clearError();
  };

  const switchMode = (newMode: AuthModalMode) => {
    resetForm();
    setMode(newMode);
  };

  const validateForm = (): boolean => {
    setLocalError('');

    if (!email.trim()) {
      setLocalError('L\'email est requis');
      return false;
    }

    if (mode !== 'forgot-password' && !password) {
      setLocalError('Le mot de passe est requis');
      return false;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setLocalError('Le nom est requis');
        return false;
      }
      if (!phone.trim()) {
        setLocalError('Le numéro de téléphone est requis');
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
    }

    return true;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  setSuccessMessage('');

  if (!validateForm()) return;

  try {
    if (mode === 'login') {
      await login(email, password);
      const authState = useAuthStore.getState();
      if (authState.user) {
        appLogin({
          id: String(authState.user.id),
          name: authState.user.name,
          email: authState.user.email,
          phoneNumber: authState.user.phone || undefined,
          avatar: authState.user.avatar || undefined,
          createdAt: authState.user.created_at,
          isPremium: false,
        });
        toggleAuthModal(false); // Fermer la modal après connexion
      }
    } else if (mode === 'register') {
      await register(name, email, phone, password);
      showCheckEmail(email);
      toggleAuthModal(false); // Fermer après inscription
    } else if (mode === 'forgot-password') {
      const message = await forgotPassword(email);
      setSuccessMessage(message);
      // Ne pas fermer pour que l'utilisateur voie le message
    }
  } catch (err) {
    // Error is handled by the store
    console.error('Auth error:', err);
  }
};

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-md w-[95%]">
        <GlassCard className="w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
          <button
            onClick={() => toggleAuthModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {mode === 'forgot-password' && (
            <button
              onClick={() => switchMode('login')}
              className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Retour</span>
            </button>
          )}

          <h2 className="text-2xl font-bold mb-6 text-center">
            {mode === 'login' && 'Connexion'}
            {mode === 'register' && 'Créer un compte'}
            {mode === 'forgot-password' && 'Mot de passe oublié'}
          </h2>

          {displayError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{displayError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nom complet</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Téléphone</label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
            )}

            {mode !== 'forgot-password' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Mot de passe</label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Confirmer le mot de passe</label>
                <PasswordInput
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  className="text-sm text-blue-400 hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full mt-6" loading={isLoading} disabled={isLoading}>
              {mode === 'login' && 'Se connecter'}
              {mode === 'register' && "S'inscrire"}
              {mode === 'forgot-password' && 'Envoyer le lien'}
            </Button>
          </form>

          {mode !== 'forgot-password' && (
            <div className="mt-6 text-center text-sm text-slate-500">
              {mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-400 hover:underline font-medium"
              >
                {mode === 'login' ? "S'inscrire" : "Se connecter"}
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
