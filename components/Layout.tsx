import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, User as UserIcon, LogOut, CreditCard, History, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './GlassUI';
import { ChatWidget } from './ChatWidget';
import { useTheme } from '../hooks/useTheme';
import { getStorageUrl } from '../services/api';
import { ROUTES } from '../router';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout: logoutStore, toggleAuthModal } = useAppStore();
  const { logout: logoutAuth } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutStore();
    logoutAuth();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-glass-text transition-colors duration-500 overflow-x-hidden">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-glass-border bg-glass-100 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to={user ? ROUTES.DASHBOARD : ROUTES.HOME} className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg group-hover:shadow-blue-500/30 transition-all">
              P
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:to-blue-400 transition-all">
              PRIMO
            </span>
          </Link>

          {/* Right Nav */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleTheme}
              className="p-1.5 md:p-2 rounded-full hover:bg-glass-200 text-glass-text transition-colors shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2 md:gap-3">
                {!user.isPremium && (
                   <Button
                    variant="primary"
                    className="hidden sm:flex px-3 py-1.5 h-8 text-xs md:text-sm"
                    onClick={() => navigate(ROUTES.PLANS)}
                   >
                     Premium
                   </Button>
                )}
                {/* Mobile Premium Icon only */}
                {!user.isPremium && (
                   <button
                    onClick={() => navigate(ROUTES.PLANS)}
                    className="sm:hidden w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg"
                   >
                     <CreditCard size={14} />
                   </button>
                )}

                <div className="relative group">
                  <button className="flex items-center gap-2 hover:bg-glass-200 px-2 py-1 md:px-3 md:py-1.5 rounded-full transition-all border border-transparent hover:border-glass-border">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {user.avatar ? (
                        <img src={getStorageUrl(user.avatar) || ''} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-glass-bg border border-glass-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 backdrop-blur-xl">
                    <Link to={ROUTES.PROFILE} className="w-full text-left px-4 py-2 hover:bg-glass-200 flex items-center gap-2 text-sm">
                      <UserIcon size={16} /> Mon Profil
                    </Link>
                    <Link to={ROUTES.DASHBOARD} className="w-full text-left px-4 py-2 hover:bg-glass-200 flex items-center gap-2 text-sm">
                      <LayoutDashboard size={16} /> Mon Dashboard
                    </Link>
                    <Link to={ROUTES.HISTORY} className="w-full text-left px-4 py-2 hover:bg-glass-200 flex items-center gap-2 text-sm">
                      <History size={16} /> Mon Historique
                    </Link>
                    <Link to={ROUTES.SUBSCRIPTION} className="w-full text-left px-4 py-2 hover:bg-glass-200 flex items-center gap-2 text-sm">
                      <CreditCard size={16} /> Abonnement
                    </Link>
                    <div className="h-px bg-glass-border my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-glass-200 text-red-400 flex items-center gap-2 text-sm">
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAuthModal(true)} className="text-xs md:text-sm font-medium hover:text-blue-400 transition-colors whitespace-nowrap">
                  Connexion
                </button>
                <Button onClick={() => toggleAuthModal(true)} className="px-3 py-1.5 h-8 text-xs md:text-sm whitespace-nowrap">
                  <span className="hidden sm:inline">Essai Gratuit</span>
                  <span className="sm:hidden">Essai</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-glass-border bg-glass-100 py-12 mt-auto backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-1 md:col-span-2">
             <div className="font-bold text-lg mb-4 text-glass-text">PRIMO</div>
             <p className="text-slate-500 max-w-xs leading-relaxed">
               La plateforme n°1 pour la préparation du TCF Canada. Simulations conformes, corrections IA et suivi de progression.
             </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-glass-text">Liens Rapides</h4>
            <ul className="space-y-2 text-slate-500">
              <li><Link to={ROUTES.HOME} className="hover:text-blue-400">Accueil</Link></li>
              <li><Link to={ROUTES.PLANS} className="hover:text-blue-400">Tarifs</Link></li>
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
          © 2024 PRIMO. Tous droits réservés.
        </div>
      </footer>

      {/* Global Chat Widget */}
      <ChatWidget />
    </div>
  );
};
