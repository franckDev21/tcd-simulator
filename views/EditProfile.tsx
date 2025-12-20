import React, { useState, useRef } from 'react';
import { User, Mail, Lock, Camera, Save, ArrowLeft, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { GlassCard, Button } from '../components/GlassUI';
import { PhoneInput } from '../components/PhoneInput';
import { PasswordInput } from '../components/PasswordInput';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import profileService from '../services/profileService';
import { getStorageUrl } from '../services/api';

export const EditProfile: React.FC = () => {
  const { user, updateUser, setView } = useAppStore();
  const { setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(getStorageUrl(user?.avatar) || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const clearPasswordMessages = () => {
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const response = await profileService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      // Update both stores
      setUser(response.user);
      updateUser({
        name: response.user.name,
        email: response.user.email,
        phoneNumber: response.user.phone || undefined,
        avatar: response.user.avatar || undefined,
      });

      setSuccess(response.message);

      if (response.email_verification_required) {
        setSuccess('Profil mis à jour. Veuillez vérifier votre nouvelle adresse email.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('L\'image ne peut pas dépasser 2 Mo');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    clearMessages();
    setAvatarLoading(true);

    try {
      const response = await profileService.updateAvatar(selectedFile);

      setUser(response.user);
      updateUser({
        avatar: response.user.avatar || undefined,
      });

      // Update preview with full URL from API response
      setAvatarPreview(response.avatar_url);
      setSelectedFile(null);
      setSuccess('Photo de profil mise à jour');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    clearMessages();
    setAvatarLoading(true);

    try {
      await profileService.deleteAvatar();

      setUser({ ...useAuthStore.getState().user!, avatar: null });
      updateUser({ avatar: undefined });
      setAvatarPreview(null);
      setSelectedFile(null);

      setSuccess('Photo de profil supprimée');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    clearPasswordMessages();

    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      setPasswordError('Tous les champs sont requis');
      return;
    }

    if (passwordData.new.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await profileService.updatePassword({
        current_password: passwordData.current,
        password: passwordData.new,
        password_confirmation: passwordData.confirm,
      });

      setPasswordSuccess(response.message);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
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

      {/* Global Messages */}
      {error && (
        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-3 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Avatar */}
        <div className="md:col-span-1">
          <GlassCard className="flex flex-col items-center p-8 text-center">
            <div className="relative group cursor-pointer mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-glass-border shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">{formData.name.charAt(0)}</span>
                )}
              </div>
              <div
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="text-white" size={32} />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
            <h3 className="font-bold text-lg mb-1">{formData.name}</h3>
            <p className="text-sm text-slate-400 mb-4">Cliquez sur l'image pour la modifier</p>

            {selectedFile && (
              <Button
                onClick={handleAvatarUpload}
                loading={avatarLoading}
                className="w-full mb-2"
                disabled={avatarLoading}
              >
                Enregistrer la photo
              </Button>
            )}

            {avatarPreview && !selectedFile && (
              <Button
                variant="ghost"
                onClick={handleAvatarDelete}
                loading={avatarLoading}
                className="text-red-400 hover:text-red-300"
                disabled={avatarLoading}
              >
                <Trash2 size={16} /> Supprimer la photo
              </Button>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Information Form */}
          <GlassCard title="Informations Personnelles">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nom complet</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all"
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
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-glass-200 border border-glass-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Numéro de téléphone</label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" loading={loading} icon={Save} disabled={loading}>
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* Password Change Form */}
          <GlassCard title="Sécurité">
            {passwordError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Lock size={16} /> Changer le mot de passe
              </h4>

              <PasswordInput
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                placeholder="Mot de passe actuel"
                showIcon={false}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <PasswordInput
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  placeholder="Nouveau mot de passe"
                  showIcon={false}
                />
                <PasswordInput
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  placeholder="Confirmer le nouveau mot de passe"
                  showIcon={false}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" loading={passwordLoading} variant="secondary" disabled={passwordLoading}>
                  Changer le mot de passe
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
