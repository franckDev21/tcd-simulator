import React from 'react';
import { Lock, Unlock, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ModuleType } from '../types';
import { Button } from '../components/GlassUI';

interface SeriesSelectionProps {
  onSelectSeries: (seriesId: number) => void;
}

export const SeriesSelection: React.FC<SeriesSelectionProps> = ({ onSelectSeries }) => {
  const { activeModule, user, setView } = useAppStore();

  // Generate 21 series for display
  const seriesList = Array.from({ length: 21 }, (_, i) => i + 1);

  // Logic: First 3 are free, rest require premium
  const isSeriesLocked = (id: number) => {
    if (user?.isPremium) return false;
    return id > 3;
  };

  const handleSeriesClick = (id: number) => {
    if (isSeriesLocked(id)) {
      if (confirm("Cette série est réservée aux membres Premium. Voulez-vous voir les offres ?")) {
        setView('SUBSCRIPTION');
      }
    } else {
      onSelectSeries(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-fade-in">
      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 relative">
        <div className="w-full md:w-auto flex justify-start">
          <Button variant="ghost" onClick={() => setView('DASHBOARD')} className="pl-0 md:pl-4">
            <ArrowLeft size={20} className="mr-2" /> Retour
          </Button>
        </div>
        
        <div className="flex-1 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-400 uppercase leading-tight">
                {activeModule} <span className="text-glass-text">PRO</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Sélectionnez une série pour commencer</p>
        </div>
        
        {/* Spacer for Desktop Balance */}
        <div className="hidden md:block w-24"></div> 
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {seriesList.map((id) => {
          const locked = isSeriesLocked(id);
          
          return (
            <button
              key={id}
              onClick={() => handleSeriesClick(id)}
              className={`
                relative h-14 md:h-16 rounded-full flex items-center justify-center font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg
                ${locked 
                  ? 'bg-gray-600/40 text-gray-300 cursor-not-allowed border border-gray-600' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 shadow-blue-500/30'
                }
              `}
            >
              <span className="mr-2">
                {activeModule?.split(' ')[0]} Série {id}
              </span>
              {locked ? <Lock size={16} className="opacity-70" /> : null}
            </button>
          );
        })}
      </div>

      {!user?.isPremium && (
          <div className="mt-8 md:mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 text-center">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Débloquez les 50+ Séries</h3>
              <p className="text-slate-300 mb-6 text-sm md:text-base">Accédez à l'intégralité des examens blancs et maximisez votre score.</p>
              <Button onClick={() => setView('SUBSCRIPTION')} className="w-full md:w-auto px-8">Passer Premium</Button>
          </div>
      )}
    </div>
  );
};