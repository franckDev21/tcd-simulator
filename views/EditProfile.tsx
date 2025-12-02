
import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Camera, Save, ArrowLeft } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { useAppStore } from '../store/useAppStore';

export const EditProfile: React.FC = () => {
  const { user, updateUser, setView } = useAppStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      updateUser({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        avatar: formData.avatar
      });
      setLoading(false);
    }, 1500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => setView('PROFILE')}>
          <ArrowLeft size={20} /> Retour
        </Button>
        <h1 className="text-3xl font-bold">Modifier le profil</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Avatar */}
        <div className="md:col-span-1">
          <GlassCard className="flex flex-col items-center p-8 text-center">
            <div className="relative group cursor-pointer mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-glass-border shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">{formData.name.charAt(0)}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={32} />
              </div>
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleAvatarChange}
              />
            </div>
            <h3 className="font-bold text-lg mb-1">{formData.name}</h3>
            <p className="text-sm text-slate-400">Cliquez sur l'image pour la modifier</p>
          </GlassCard>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2">
          <GlassCard title="Informations Personnelles">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nom complet</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-glass-100 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-glass-100 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Numéro de téléphone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="tel" 
                    placeholder="+237 6XX XX XX XX"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full bg-glass-100 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" 
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-glass-border">
                <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <Lock size={16} /> Changer le mot de passe
                </h4>
                <div className="space-y-4">
                   <input 
                      type="password" 
                      placeholder="Mot de passe actuel"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                      className="w-full bg-glass-100 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" 
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input 
                        type="password" 
                        placeholder="Nouveau mot de passe"
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                        className="w-full bg-glass-100 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" 
                      />
                      <input 
                        type="password" 
                        placeholder="Confirmer le nouveau mot de passe"
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                        className="w-full bg-glass-100 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" 
                      />
                    </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button loading={loading} icon={Save}>
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
