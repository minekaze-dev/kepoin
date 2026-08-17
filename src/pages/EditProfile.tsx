import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Shield, ShieldOff, Check, Lock, AlertCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/i18n';

export const EditProfile = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const user = storage.getUser();
  const cooldownStatus = storage.canChangeUsername(user);
  
  const [formData, setFormData] = useState<UserProfile>({
    ...user
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cleanCurrentUsername = user.username.toLowerCase();
  const cleanInputUsername = formData.username.trim().toLowerCase();
  const isUsernameModified = cleanInputUsername !== cleanCurrentUsername;
  const usernameBody = formData.username.replace('@', '').trim();
  const isTaken = isUsernameModified && storage.isUsernameTaken(formData.username, user.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate username if changed
    if (isUsernameModified) {
      if (!cooldownStatus.allowed) {
        setErrorMessage(
          lang === 'id'
            ? `Username hanya bisa diganti 7 hari sekali. Kamu bisa menggantinya lagi dalam ${cooldownStatus.daysRemaining} hari.`
            : `Username can only be changed once every 7 days. You can change it again in ${cooldownStatus.daysRemaining} days.`
        );
        return;
      }

      if (usernameBody.length < 3) {
        setErrorMessage(
          lang === 'id' ? 'Username minimal 3 karakter.' : 'Username must be at least 3 characters.'
        );
        return;
      }

      if (!/^[a-zA-Z0-9_.]+$/.test(usernameBody)) {
        setErrorMessage(
          lang === 'id'
            ? 'Username hanya boleh mengandung huruf, angka, titik (.), dan underscore (_).'
            : 'Username can only contain letters, numbers, dots (.), and underscores (_).'
        );
        return;
      }

      if (storage.isUsernameTaken(formData.username, user.id)) {
        setErrorMessage(
          lang === 'id'
            ? `Username @${usernameBody} sudah dipakai pengguna lain. Silakan pilih username yang berbeda!`
            : `Username @${usernameBody} is already taken by another user. Please choose a different username!`
        );
        return;
      }
    }

    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      const payload: UserProfile = {
        ...formData,
        username: formData.username.startsWith('@') ? formData.username : `@${formData.username}`,
      };
      storage.saveUser(payload);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => navigate('/profile'), 1500);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors text-gray-600 dark:text-dark-muted cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
          {lang === 'id' ? 'Edit Profil' : 'Edit Profile'}
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-400 text-[13px] animate-in fade-in">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white dark:border-dark-surface shadow-xl">
              <img 
                src={formData.avatar} 
                alt={formData.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera size={24} />
              <input 
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>
          <div className="w-full max-w-xs text-center">
            <label className="block text-[13px] font-bold text-gray-500 dark:text-dark-muted mb-2 uppercase tracking-wide">
              {lang === 'id' ? 'Foto Profil' : 'Avatar Photo'}
            </label>
            <p className="text-[11px] text-gray-400 dark:text-dark-muted mb-4 italic">
              {lang === 'id' ? 'Klik foto untuk unggah dari perangkat' : 'Click photo to upload from device'}
            </p>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-[11px] font-bold text-gray-400 uppercase">URL</span>
              </div>
              <input
                type="text"
                value={formData.avatar?.startsWith('data:') ? 'Image uploaded from device' : formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                disabled={formData.avatar?.startsWith('data:')}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-[14px] focus:ring-2 focus:ring-[#12A889] outline-none transition-all dark:text-dark-text disabled:opacity-50"
                placeholder="https://example.com/avatar.jpg"
              />
              {formData.avatar?.startsWith('data:') && (
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#12A889] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-500 dark:text-dark-muted mb-2 uppercase tracking-wide">
              {lang === 'id' ? 'Nama Tampilan' : 'Display Name'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-[14px] focus:ring-2 focus:ring-[#12A889] outline-none transition-all dark:text-dark-text"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[13px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wide">
                Username
              </label>
              {!cooldownStatus.allowed && (
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                  <Lock size={12} /> {cooldownStatus.daysRemaining} {lang === 'id' ? 'hari lagi' : 'days left'}
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
              <input
                type="text"
                required
                disabled={!cooldownStatus.allowed}
                value={formData.username.replace('@', '')}
                onChange={(e) => setFormData({ ...formData, username: `@${e.target.value.toLowerCase().replace(/\s+/g, '')}` })}
                className={`w-full pl-8 pr-4 py-3 bg-white dark:bg-dark-surface border rounded-xl text-[14px] outline-none transition-all dark:text-dark-text ${
                  !cooldownStatus.allowed
                    ? 'bg-gray-100 dark:bg-dark-bg/80 text-gray-500 cursor-not-allowed border-gray-200 dark:border-dark-border'
                    : isTaken
                    ? 'border-red-400 focus:ring-2 focus:ring-red-400'
                    : isUsernameModified && usernameBody.length >= 3
                    ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-400'
                    : 'border-gray-200 dark:border-dark-border focus:ring-2 focus:ring-[#12A889]'
                }`}
              />
            </div>

            {/* Username Status / Cooldown info */}
            {!cooldownStatus.allowed ? (
              <p className="text-[11.5px] text-amber-600 dark:text-amber-400 font-medium">
                ⏳ {lang === 'id' 
                  ? `Username hanya dapat diganti 7 hari sekali. Baru bisa diubah lagi dalam ${cooldownStatus.daysRemaining} hari.` 
                  : `Username can only be changed once every 7 days. You can change it again in ${cooldownStatus.daysRemaining} days.`}
              </p>
            ) : isUsernameModified ? (
              <div className="text-[11.5px] font-medium">
                {isTaken ? (
                  <span className="text-red-500 flex items-center gap-1 font-bold">
                    ✕ {lang === 'id' ? 'Username sudah digunakan orang lain' : 'Username is already taken'}
                  </span>
                ) : usernameBody.length < 3 ? (
                  <span className="text-amber-500">
                    {lang === 'id' ? 'Minimal 3 karakter' : 'Minimum 3 characters'}
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    ✓ {lang === 'id' ? 'Username tersedia & unik' : 'Username is available & unique'}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 dark:text-dark-muted">
                {lang === 'id' ? 'Perhatian: Mengganti username akan mengaktifkan jeda 7 hari.' : 'Note: Changing username sets a 7-day cooldown.'}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-gray-500 dark:text-dark-muted mb-2 uppercase tracking-wide">
            {lang === 'id' ? 'Bio / Status' : 'Bio / Status'}
          </label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-[14px] focus:ring-2 focus:ring-[#12A889] outline-none transition-all dark:text-dark-text resize-none"
            placeholder={lang === 'id' ? 'Ceritakan sedikit tentang dirimu...' : 'Tell us about yourself...'}
          />
        </div>

        {/* Privacy Toggle */}
        <div className="p-4 bg-orange-50 dark:bg-[#12A889]/5 border border-orange-100 dark:border-[#12A889]/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${formData.isPrivate ? 'bg-[#12A889] text-white' : 'bg-white dark:bg-dark-surface text-[#12A889] shadow-sm'}`}>
              {formData.isPrivate ? <Shield size={24} /> : <ShieldOff size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-dark-text">
                {lang === 'id' ? 'Akun Privat' : 'Private Account'}
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-dark-muted">
                {lang === 'id' ? 'Pengguna lain tidak akan melihat drops kamu di profil.' : "Others won't see your drops on your profile."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${formData.isPrivate ? 'bg-[#12A889]' : 'bg-gray-200 dark:bg-dark-border'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isPrivate ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving || showSuccess || isTaken}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              showSuccess ? 'bg-green-500 shadow-green-500/20' : 'bg-[#12A889] hover:bg-[#12A889] shadow-[#12A889]/20'
            }`}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : showSuccess ? (
              <>
                <Check size={20} />
                {lang === 'id' ? 'Berhasil Disimpan' : 'Saved Successfully'}
              </>
            ) : (
              lang === 'id' ? 'Simpan Perubahan' : 'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
