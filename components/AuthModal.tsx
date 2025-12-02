import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { GlassCard, Button } from './GlassUI';
import { useAppStore } from '../store/useAppStore';

export const AuthModal: React.FC = () => {
  const { toggleAuthModal, login } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API
    setTimeout(() => {
      login({
        id: '1',
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        isPremium: false
      });
      setLoading(false);
    }, 1000);
  };

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
          
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nom complet</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" className="w-full bg-glass-100 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" placeholder="Votre nom" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" className="w-full bg-glass-100 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" placeholder="nom@exemple.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" className="w-full bg-glass-100 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" placeholder="••••••••" />
              </div>
            </div>

            <Button className="w-full mt-6" loading={loading}>
              {isLogin ? 'Se connecter' : "S'inscrire"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:underline font-medium"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};