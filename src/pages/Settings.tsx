/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogOut, Lock } from 'lucide-react';
import { storage } from '../lib/storage';
import { UserProfile } from '../types';

import { useLanguage } from '../lib/i18n';
import { useTheme } from '../lib/theme';

export const Settings = () => {
  const { lang, t, toggleLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isLoggedIn = storage.getIsLoggedIn();
  const initialUser = storage.getUser();
  const [user, setUser] = useState<UserProfile>(initialUser);
  const cooldownStatus = storage.canChangeUsername(initialUser);
  const [showTrending, setShowTrending] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [defaultAnonymous, setDefaultAnonymous] = useState(false);

  const cleanInitialUsername = initialUser.username.toLowerCase();
  const cleanInputUsername = user.username.trim().toLowerCase();
  const isUsernameModified = cleanInputUsername !== cleanInitialUsername;
  const usernameBody = user.username.replace('@', '').trim();
  const isTaken = isUsernameModified && storage.isUsernameTaken(user.username, initialUser.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isUsernameModified) {
      if (!cooldownStatus.allowed) {
        alert(
          lang === 'id'
            ? `Username hanya bisa diganti 7 hari sekali. Kamu bisa menggantinya lagi dalam ${cooldownStatus.daysRemaining} hari.`
            : `Username can only be changed once every 7 days. You can change it again in ${cooldownStatus.daysRemaining} days.`
        );
        return;
      }

      if (usernameBody.length < 3) {
        alert(lang === 'id' ? 'Username minimal 3 karakter.' : 'Username must be at least 3 characters.');
        return;
      }

      if (!/^[a-zA-Z0-9_.]+$/.test(usernameBody)) {
        alert(
          lang === 'id'
            ? 'Username hanya boleh mengandung huruf, angka, titik (.), dan garis bawah (_).'
            : 'Username can only contain letters, numbers, dots (.), and underscores (_).'
        );
        return;
      }

      if (storage.isUsernameTaken(user.username, initialUser.id)) {
        alert(
          lang === 'id'
            ? `Username @${usernameBody} sudah dipakai oleh pengguna lain. Silakan pilih username berbeda!`
            : `Username @${usernameBody} is already taken by another user. Please choose a different username!`
        );
        return;
      }
    }

    const payload: UserProfile = {
      ...user,
      username: user.username.startsWith('@') ? user.username : `@${user.username}`
    };

    storage.saveUser(payload);
    alert(lang === 'id' ? 'Pengaturan berhasil disimpan!' : 'Settings saved successfully!');
  };

  const handleLogout = () => {
    if (confirm(lang === 'id' ? 'Apakah Anda yakin ingin keluar dari akun?' : 'Are you sure you want to log out?')) {
      storage.setIsLoggedIn(false);
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <header>
        <h1 className="text-2xl md:text-[28px] font-bold text-charcoal dark:text-dark-text tracking-tight">{t.settings.header}</h1>
        <p className="text-[14px] text-gray-500 dark:text-dark-muted">{t.settings.subtitle}</p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-400">{t.settings.preferences}</h2>
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-6 space-y-4 shadow-sm">
            {/* Theme Selector */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-border">
              <div>
                <p className="text-[14px] font-bold dark:text-dark-text">{t.settings.theme}</p>
                <p className="text-[12px] text-gray-400 dark:text-dark-muted">{t.settings.themeSub}</p>
              </div>
              <div className="flex gap-1 bg-gray-50 dark:bg-dark-bg p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded text-[12px] font-bold transition-all ${theme === 'light' ? 'bg-white shadow-sm text-[#12A889]' : 'text-gray-400'}`}
                >
                  {t.settings.themeLight}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded text-[12px] font-bold transition-all ${theme === 'dark' ? 'bg-white dark:bg-dark-surface shadow-sm text-[#12A889]' : 'text-gray-400'}`}
                >
                  {t.settings.themeDark}
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-border">
              <div>
                <p className="text-[14px] font-bold dark:text-dark-text">{t.settings.language}</p>
                <p className="text-[12px] text-gray-400 dark:text-dark-muted">Choose your preferred language.</p>
              </div>
              <div className="flex gap-1 bg-gray-50 dark:bg-dark-bg p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleLang('en')}
                  className={`px-3 py-1 rounded text-[12px] font-bold transition-all ${lang === 'en' ? 'bg-white dark:bg-dark-surface shadow-sm text-[#12A889]' : 'text-gray-400'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => toggleLang('id')}
                  className={`px-3 py-1 rounded text-[12px] font-bold transition-all ${lang === 'id' ? 'bg-white dark:bg-dark-surface shadow-sm text-[#12A889]' : 'text-gray-400'}`}
                >
                  Indonesian
                </button>
                <button
                  type="button"
                  onClick={() => toggleLang('slank')}
                  className={`px-3 py-1 rounded text-[12px] font-bold transition-all ${lang === 'slank' ? 'bg-white dark:bg-dark-surface shadow-sm text-[#12A889]' : 'text-gray-400'}`}
                >
                  Slank
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold dark:text-dark-text">{t.settings.showTrending}</p>
                <p className="text-[12px] text-gray-400 dark:text-dark-muted">{t.settings.showTrendingSub}</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowTrending(!showTrending)}
                className={`w-11 h-6 rounded-full transition-colors relative ${showTrending ? 'bg-[#12A889]' : 'bg-gray-200 dark:bg-dark-bg'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showTrending ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold dark:text-dark-text">{t.settings.allowReact}</p>
                <p className="text-[12px] text-gray-400 dark:text-dark-muted">{t.settings.allowReactSub}</p>
              </div>
              <button 
                type="button"
                onClick={() => setAllowReactions(!allowReactions)}
                className={`w-11 h-6 rounded-full transition-colors relative ${allowReactions ? 'bg-[#12A889]' : 'bg-gray-200 dark:bg-dark-bg'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowReactions ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold dark:text-dark-text">{t.settings.anonDefault}</p>
                <p className="text-[12px] text-gray-400 dark:text-dark-muted">{t.settings.anonDefaultSub}</p>
              </div>
              <button 
                type="button"
                onClick={() => setDefaultAnonymous(!defaultAnonymous)}
                className={`w-11 h-6 rounded-full transition-colors relative ${defaultAnonymous ? 'bg-[#12A889]' : 'bg-gray-200 dark:bg-dark-bg'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${defaultAnonymous ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        
        <section className="space-y-4">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-400">About</h2>
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center text-[14px] mb-2">
              <span className="font-black text-[#12A889] dark:text-[#12A889]">Kepoin</span>
              <span className="text-gray-400 dark:text-dark-muted font-bold text-[11px] uppercase tracking-wider">Version 1.0</span>
            </div>
            <div className="space-y-3 text-[13px] text-gray-600 dark:text-dark-muted leading-relaxed">
              <p>Kepoin adalah tempat untuk bertanya, berbagi, dan melihat jawaban dari orang lain.</p>
              <p>Dibuat sederhana, ringan, dan tanpa harus selalu serius. Karena terkadang, hal kecil yang kita tanyakan justru menghasilkan sesuatu yang menarik.</p>
              <p className="font-bold text-gray-900 dark:text-dark-text pt-2">Tanya sesuatu. Lihat apa jawabannya.</p>
            </div>
          </div>
        </section>

        {isLoggedIn && (
          <section className="space-y-4 md:hidden">
            <h2 className="text-[16px] font-bold uppercase tracking-wider text-red-500">
              {lang === 'id' ? 'Akun & Sesi' : 'Account & Session'}
            </h2>
            <div className="bg-white dark:bg-dark-surface border border-red-100 dark:border-red-950/40 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-bold text-gray-900 dark:text-dark-text">
                    {lang === 'id' ? 'Keluar dari Akun' : 'Log Out of Account'}
                  </p>
                  <p className="text-[12px] text-gray-400 dark:text-dark-muted">
                    {lang === 'id' ? 'Keluar dari sesi akun aktif kamu di perangkat ini.' : 'Sign out of your active account session on this device.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-[13px] font-bold transition-all shadow-xs cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>{lang === 'id' ? 'Keluar' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          </section>
        )}

        <button 
          type="submit"
          className="w-full py-4 bg-charcoal dark:bg-[#12A889] text-white rounded-xl font-bold text-[15px] hover:bg-black dark:hover:bg-orange-700 transition-all shadow-lg cursor-pointer"
        >
          {t.settings.saveBtn}
        </button>
      </form>
    </div>
  );
};
