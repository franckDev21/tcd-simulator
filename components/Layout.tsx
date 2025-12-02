import React from 'react';
import { Sun, Moon, User as UserIcon, LogOut, CreditCard } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button } from './GlassUI';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, theme, toggleTheme, setView, logout, toggleAuthModal } = useAppStore();

  const handleLogoClick = () => {
    if (user) setView('DASHBOARD');
    else setView('LANDING');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-glass-text transition-colors duration-500">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-glass-border bg-glass-100 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <button onClick={handleLogoClick} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-blue-500/30 transition-all">
              T
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:to-blue-400 transition-all">
              TCF SIMULATOR
            </span>
          </button>

          {/* Right Nav */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-glass-200 text-glass-text transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {!user.isPremium && (
                   <Button 
                    variant="primary" 
                    className="hidden md:flex px-4 py-1.5 h-auto text-sm"
                    onClick={() => setView('SUBSCRIPTION')}
                   >
                     Premium
                   </Button>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:bg-glass-200 px-3 py-1.5 rounded-full transition-all border border-transparent hover:border-glass-border">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-glass-bg border border-glass-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 backdrop-blur-xl">
                    <button onClick={() => setView('PROFILE')} className="w-full text-left px-4 py-2 hover:bg-glass-200 flex items-center gap-2 text-sm">
                      <UserIcon size={16} /> Mon Profil
                    </button>
                    <button onClick={() => setView('SUBSCRIPTION')} className="w-full text-left px-4 py-2 hover:bg-glass-200 flex items-center gap-2 text-sm">
                      <CreditCard size={16} /> Abonnement
                    </button>
                    <div className="h-px bg-glass-border my-1"></div>
                    <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-glass-200 text-red-400 flex items-center gap-2 text-sm">
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAuthModal(true)} className="text-sm font-medium hover:text-blue-400 transition-colors">
                  Connexion
                </button>
                <Button onClick={() => toggleAuthModal(true)} className="px-4 py-1.5 h-auto text-sm">
                  Essai Gratuit
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-glass-border bg-glass-100 py-12 mt-auto backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-1 md:col-span-2">
             <div className="font-bold text-lg mb-4 text-glass-text">TCF SIMULATOR</div>
             <p className="text-slate-500 max-w-xs leading-relaxed">
               La plateforme n°1 pour la préparation du TCF Canada. Simulations conformes, corrections IA et suivi de progression.
             </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-glass-text">Liens Rapides</h4>
            <ul className="space-y-2 text-slate-500">
              <li><button onClick={() => setView('LANDING')} className="hover:text-blue-400">Accueil</button></li>
              <li><button onClick={() => setView('SUBSCRIPTION')} className="hover:text-blue-400">Tarifs</button></li>
              <li><button className="hover:text-blue-400">Blog</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-glass-text">Légal</h4>
            <ul className="space-y-2 text-slate-500">
              <li>Conditions d'utilisation</li>
              <li>Politique de confidentialité</li>
              <li>Mentions légales</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-glass-border text-center text-slate-600 text-xs">
          © 2024 TCF Simulator. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};