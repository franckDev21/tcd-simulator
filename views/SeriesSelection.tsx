import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowLeft, Loader } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ModuleType } from '../types';
import { Button } from '../components/GlassUI';
import { examService, ExamSeries } from '../services/examService';
import { ROUTES } from '../router';

// Map URL code to ModuleType
const codeToModule: Record<string, ModuleType> = {
  'CE': ModuleType.READING,
  'CO': ModuleType.LISTENING,
  'EE': ModuleType.WRITING,
  'EO': ModuleType.SPEAKING,
};

export const SeriesSelection: React.FC = () => {
  const navigate = useNavigate();
  const { module } = useParams<{ module: string }>();
  const { user } = useAppStore();
  const [seriesList, setSeriesList] = useState<ExamSeries[]>([]);
  const [loading, setLoading] = useState(true);

  const moduleCode = decodeURIComponent(module || 'CE');
  const activeModule = codeToModule[moduleCode] || ModuleType.READING;

  useEffect(() => {
    const fetchSeries = async () => {
        try {
            const data = await examService.getAllExams();
            // Filter by module code from URL
            const filtered = data.filter(s => s.module_type === moduleCode);
            setSeriesList(filtered);
        } catch (error) {
            console.error("Failed to fetch exams", error);
        } finally {
            setLoading(false);
        }
    };
    fetchSeries();
  }, [moduleCode]);

  const handleSeriesClick = (series: ExamSeries) => {
    // If premium is required
    if (series.is_premium && !user?.isPremium) {
      if (confirm("Cette serie est reservee aux membres Premium. Voulez-vous voir les offres ?")) {
        navigate(ROUTES.SUBSCRIPTION);
      }
    } else {
      navigate(ROUTES.EXAM(moduleCode, series.id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-fade-in">
      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 relative">
        <div className="w-full md:w-auto flex justify-start">
          <Button variant="ghost" onClick={() => navigate(ROUTES.DASHBOARD)} className="pl-0 md:pl-4">
            <ArrowLeft size={20} className="mr-2" /> Retour
          </Button>
        </div>
        
        <div className="flex-1 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-400 uppercase leading-tight animate-fade-in-up">
                {activeModule} <span className="text-glass-text">PRO</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base animate-fade-in-up" style={{ animationDelay: '100ms' }}>Sélectionnez une série pour commencer</p>
        </div>
        
        {/* Spacer for Desktop Balance */}
        <div className="hidden md:block w-24"></div> 
      </div>

      {loading ? (
          <div className="flex justify-center py-20">
              <Loader className="animate-spin text-blue-500" size={40} />
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {seriesList.length > 0 ? seriesList.map((series, index) => {
            const isLocked = series.is_premium && !user?.isPremium;
            
            return (
                <button
                key={series.id}
                onClick={() => handleSeriesClick(series)}
                className={`
                    relative h-14 md:h-16 rounded-full flex items-center justify-center font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg animate-scale-in opacity-0
                    ${isLocked 
                    ? 'bg-gray-600/40 text-gray-300 cursor-not-allowed border border-gray-600' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 shadow-blue-500/30'
                    }
                `}
                style={{ animationDelay: `${index * 30}ms` }}
                >
                <span className="mr-2">
                    {series.title}
                </span>
                {isLocked ? <Lock size={16} className="opacity-70" /> : null}
                </button>
            );
            }) : (
                <div className="col-span-3 text-center py-10 text-slate-400">
                    Aucune série disponible pour ce module pour l'instant.
                </div>
            )}
        </div>
      )}

      {!user?.isPremium && (
          <div className="mt-8 md:mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 text-center animate-fade-in-up opacity-0" style={{ animationDelay: '600ms' }}>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Débloquez les 50+ Séries</h3>
              <p className="text-slate-300 mb-6 text-sm md:text-base">Accédez à l'intégralité des examens blancs et maximisez votre score.</p>
              <Button onClick={() => navigate(ROUTES.SUBSCRIPTION)} className="w-full md:w-auto px-8">Passer Premium</Button>
          </div>
      )}
    </div>
  );
};