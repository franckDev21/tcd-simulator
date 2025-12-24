import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Building2, Users, Mail, Phone, User, CheckCircle } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { ROUTES } from '../router';

export const ContactSales: React.FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
        <GlassCard className="max-w-md w-full text-center p-8 md:p-12">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Message Envoyé !</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Merci de l'intérêt que vous portez à PRIMO Business. Notre équipe commerciale a bien reçu votre demande et vous recontactera sous 24h ouvrées.
          </p>
          <Button onClick={() => setView('ALL_PLANS')} className="w-full">
            Retour aux offres
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => setView('ALL_PLANS')}>
          <ArrowLeft size={20} /> Retour
        </Button>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left Info Column */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-glass-text mb-4">Solutions Entreprises</h1>
            <p className="text-slate-500 leading-relaxed">
              Equipez votre centre de formation ou votre école de langue avec la technologie PRIMO. Tableaux de bord enseignants, licences en volume et support dédié.
            </p>
          </div>

          <GlassCard className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border-blue-500/20 transition-colors duration-300">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Pourquoi PRIMO Business ?</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <CheckCircle size={16} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>Suivi centralisé des élèves</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle size={16} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>Tarifs dégressifs (jusqu'à -40%)</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle size={16} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>Facturation unifiée</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle size={16} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>Marque blanche (Optionnel)</span>
              </li>
            </ul>
          </GlassCard>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-3">
          <GlassCard title="Formulaire de contact">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nom du contact</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required type="text" className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all text-glass-text placeholder-slate-400" placeholder="Jean Dupont" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nom de l'organisation</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required type="text" className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all text-glass-text placeholder-slate-400" placeholder="École..." />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Email professionnel</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required type="email" className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all text-glass-text placeholder-slate-400" placeholder="contact@ecole.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required type="tel" className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all text-glass-text placeholder-slate-400" placeholder="+237..." />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nombre d'élèves estimé</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer text-glass-text">
                    <option>10 - 50 élèves</option>
                    <option>50 - 200 élèves</option>
                    <option>200 - 1000 élèves</option>
                    <option>1000+ élèves</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Message ou besoins spécifiques</label>
                <textarea 
                  className="w-full bg-glass-200 border border-glass-border rounded-xl p-4 text-sm outline-none focus:border-blue-500 transition-all min-h-[120px] text-glass-text placeholder-slate-400"
                  placeholder="Bonjour, je souhaiterais obtenir un devis pour..."
                ></textarea>
              </div>

              <div className="pt-2">
                <Button loading={loading} className="w-full" icon={Send}>
                  Envoyer la demande
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
