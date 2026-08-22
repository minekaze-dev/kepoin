/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { storage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { X, Eye, EyeOff, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalMode = 'login' | 'register' | 'forgot';

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { t, lang } = useLanguage();
  const [mode, setMode] = useState<ModalMode>('login');
  
  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setResetSent(false);
    setErrorMessage('');
    setIsLoading(false);
    setIsRegistrationSuccess(false);
  };

  const handleModeChange = (newMode: ModalMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const input = email.trim();
      const pass = password.trim();

      // Check if input is email or username
      let userEmail = input;
      let targetUser = null;

      if (!input.includes('@') || input.startsWith('@')) {
        const cleanUser = input.startsWith('@') ? input : `@${input}`;
        targetUser = storage.getUserByUsername(cleanUser);
        if (targetUser?.email) {
          userEmail = targetUser.email;
        }
      }

      // Try Supabase Auth SignIn
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail.includes('@') && !userEmail.startsWith('@') ? userEmail : `${input.replace('@', '')}@kepoin.app`,
        password: pass,
      });

      if (authError) {
        setErrorMessage(lang === 'id' ? 'Email atau kata sandi salah' : 'Invalid email or password');
        setIsLoading(false);
        return;
      }
      
      if (authData.user) {
        // Fetch or create profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profile) {
          storage.saveUser({
            id: profile.id,
            name: profile.name,
            username: profile.username,
            email: profile.email || authData.user.email,
            avatar: profile.avatar,
            bio: profile.bio,
            location: profile.location,
            isPrivate: profile.is_private,
            joinedAt: profile.created_at,
            role: profile.role,
            status: profile.status,
          });
        } else {
          storage.saveUser({
            id: authData.user.id,
            name: authData.user.user_metadata?.name || input.replace('@', ''),
            username: authData.user.user_metadata?.username || (input.startsWith('@') ? input : `@${input}`),
            email: authData.user.email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${input}`,
            joinedAt: new Date().toISOString(),
          });
        }

        storage.setIsLoggedIn(true);
        // Sync data from Supabase for this user
        await storage.syncWithSupabase();
        onClose();
        window.location.reload();
        return;
      }

      // Local matching if user was registered locally or offline
      const foundUser = targetUser || storage.getAllUsers().find(u => 
        (u.email && u.email.toLowerCase() === input.toLowerCase()) ||
        storage.normalizeUsername(u.username) === storage.normalizeUsername(input)
      );

      if (foundUser) {
        storage.saveUser(foundUser);
        storage.setIsLoggedIn(true);
        await storage.syncWithSupabase();
        onClose();
        window.location.reload();
        return;
      }

      // If user exists in Supabase DB table
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${input},username.eq.${input},username.eq.@${input}`)
        .single();

      if (dbUser) {
        storage.saveUser({
          id: dbUser.id,
          name: dbUser.name,
          username: dbUser.username,
          email: dbUser.email,
          avatar: dbUser.avatar,
          bio: dbUser.bio,
          location: dbUser.location,
          role: dbUser.role,
          status: dbUser.status,
          joinedAt: dbUser.created_at
        });
        storage.setIsLoggedIn(true);
        onClose();
        window.location.reload();
        return;
      }

      // If login credentials not found, show helpful error
      setErrorMessage(
        lang === 'id' 
          ? 'Akun tidak ditemukan atau kata sandi tidak cocok. Silakan daftar jika belum memiliki akun.'
          : 'Account not found or password incorrect. Please sign up if you do not have an account.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Login error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = username.trim().startsWith('@') 
      ? username.trim() 
      : `@${username.trim() || 'user'}`;
    
    // Validate username format
    const usernameBody = cleanUsername.replace('@', '');
    if (usernameBody.length < 3) {
      setErrorMessage(lang === 'id' 
        ? 'Username minimal harus 3 karakter.' 
        : 'Username must be at least 3 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(usernameBody)) {
      setErrorMessage(lang === 'id'
        ? 'Username hanya boleh berisi huruf, angka, titik (.), dan garis bawah (_).'
        : 'Username can only contain letters, numbers, dots (.), and underscores (_).');
      return;
    }

    // Check if username is already taken by any user
    const { data: takenUser, error: takenError } = await supabase
      .from('users')
      .select('id')
      .eq('username', cleanUsername)
      .single();

    if (!takenError && takenUser) {
      setErrorMessage(lang === 'id'
        ? `Username ${cleanUsername} sudah digunakan oleh pengguna lain. Silakan pilih username yang berbeda!`
        : `Username ${cleanUsername} is already taken by another user. Please choose a different one!`);
      return;
    }
    
    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isValidLength = password.length >= 8;

    if (!isValidLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      setErrorMessage(lang === 'id' 
        ? 'Kata sandi harus minimal 8 karakter dan mengandung huruf besar, huruf kecil, dan angka.' 
        : 'Password must be at least 8 characters and include uppercase, lowercase, and number.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanName = name.trim() || usernameBody;
      const cleanEmail = email.trim().toLowerCase();

      // Sign up with Supabase Auth
      const { data: authResult, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            name: cleanName,
            username: cleanUsername,
          }
        }
      });

      if (authError) throw authError;

      // DO NOT log in or save locally. Show confirmation message
      setIsRegistrationSuccess(true);
      setErrorMessage(lang === 'id'
        ? 'Pendaftaran berhasil! Silakan periksa email Anda untuk konfirmasi akun sebelum masuk.'
        : 'Registration successful! Please check your email to confirm your account before logging in.');
      
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftar akun.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      if (email.includes('@')) {
        await supabase.auth.resetPasswordForEmail(email.trim());
      }
      setResetSent(true);
    } catch (err) {
      setResetSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border w-full max-w-sm sm:max-w-[400px] max-h-[90vh] overflow-y-auto rounded-2xl p-5 shadow-2xl space-y-3.5 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-dark-text p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Branding & Subtitle */}
        <div className="text-center space-y-1 pt-1">
          <div className="flex justify-center mx-auto">
            <img src="https://imgur.com/5S09m0f.jpg" alt="Kepoin" className="w-48 h-auto object-contain" />
          </div>
          <p className="text-[12px] text-gray-500 dark:text-dark-muted px-2">
            {mode === 'login' && t.loginModal.subtitle}
            {mode === 'register' && t.loginModal.subtitleRegister}
            {mode === 'forgot' && t.loginModal.subtitleForgot}
          </p>
        </div>

        {/* Tabs for Login & Register */}
        {mode !== 'forgot' && (
          <div className="flex bg-gray-100 dark:bg-dark-bg p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-md transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-white dark:bg-dark-surface text-[#12A889] dark:text-orange-400 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-dark-text'
              }`}
            >
              {t.loginModal.logInLink}
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-md transition-all cursor-pointer ${
                mode === 'register' 
                  ? 'bg-white dark:bg-dark-surface text-[#12A889] dark:text-orange-400 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-dark-text'
              }`}
            >
              {t.loginModal.signUpLink}
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className={`p-2.5 border rounded-xl flex items-center gap-2 text-[12px] ${
            errorMessage.includes('berhasil') || errorMessage.includes('successful') 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400'
          }`}>
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-dark-muted uppercase mb-0.5">
                {t.loginModal.emailOrUsername}
              </label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.loginModal.emailPlaceholder}
                className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-[13px] text-charcoal dark:text-dark-text focus:outline-none focus:border-[#12A889] transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[11px] font-bold text-gray-600 dark:text-dark-muted uppercase">
                  {t.loginModal.password}
                </label>
                <button
                  type="button"
                  onClick={() => handleModeChange('forgot')}
                  className="text-[11px] text-[#12A889] hover:text-[#12A889] font-semibold cursor-pointer hover:underline"
                >
                  {t.loginModal.forgotPasswordLink}
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.loginModal.passwordPlaceholder}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 pr-10 text-[13px] text-charcoal dark:text-dark-text focus:outline-none focus:border-[#12A889] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-text p-1 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#12A889] to-blue-600 hover:opacity-95 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-[14px] cursor-pointer mt-1 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              <span>{isLoading ? 'Memproses...' : t.loginModal.loginBtn}</span>
            </button>

            <div className="text-center pt-1">
              <span className="text-[12px] text-gray-500 dark:text-dark-muted">
                {t.loginModal.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('register')}
                  className="text-[#12A889] hover:text-[#12A889] font-bold cursor-pointer hover:underline"
                >
                  {t.loginModal.signUpLink}
                </button>
              </span>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-dark-muted uppercase mb-0.5">
                  {t.loginModal.name}
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.loginModal.namePlaceholder}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-[13px] text-charcoal dark:text-dark-text focus:outline-none focus:border-[#12A889] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-dark-muted uppercase mb-0.5">
                  {t.loginModal.username}
                </label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder={t.loginModal.usernamePlaceholder}
                  className={`w-full bg-gray-50 dark:bg-dark-bg border rounded-lg px-3 py-2 text-[13px] text-charcoal dark:text-dark-text focus:outline-none transition-colors ${
                    username && storage.isUsernameTaken(username.startsWith('@') ? username : `@${username}`)
                      ? 'border-red-400 focus:border-red-500 dark:border-red-500/50'
                      : username && username.length >= 3 && /^[a-zA-Z0-9_.]+$/.test(username.replace('@', ''))
                      ? 'border-emerald-400 focus:border-emerald-500 dark:border-emerald-500/50'
                      : 'border-gray-200 dark:border-dark-border focus:border-[#12A889]'
                  }`}
                  required
                />
                {username && (
                  <div className="mt-0.5 text-[10px]">
                    {storage.isUsernameTaken(username.startsWith('@') ? username : `@${username}`) ? (
                      <span className="text-red-500 font-bold flex items-center gap-1">
                        ✕ {lang === 'id' ? 'Username sudah dipakai' : 'Username taken'}
                      </span>
                    ) : username.replace('@', '').length < 3 ? (
                      <span className="text-amber-500 font-medium">
                        {lang === 'id' ? 'Minimal 3 karakter' : 'Min. 3 chars'}
                      </span>
                    ) : !/^[a-zA-Z0-9_.]+$/.test(username.replace('@', '')) ? (
                      <span className="text-red-500 font-medium">
                        {lang === 'id' ? 'Hanya huruf, angka, . dan _' : 'Only letters, numbers, . & _'}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        ✓ {lang === 'id' ? 'Tersedia' : 'Available'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-dark-muted uppercase mb-0.5">
                {t.loginModal.email}
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.loginModal.emailPlaceholder}
                className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-[13px] text-charcoal dark:text-dark-text focus:outline-none focus:border-[#12A889] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-dark-muted uppercase mb-0.5">
                {t.loginModal.password}
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.loginModal.passwordPlaceholder}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 pr-10 text-[13px] text-charcoal dark:text-dark-text focus:outline-none focus:border-[#12A889] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-text p-1 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-dark-muted mt-0.5">
                {lang === 'id' 
                  ? 'Minimal 8 karakter, huruf besar, huruf kecil, & angka.' 
                  : 'Min 8 chars, uppercase, lowercase & number.'}
              </p>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#12A889] to-blue-600 hover:opacity-95 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-[14px] cursor-pointer mt-1 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              <span>{isLoading ? 'Mendaftarkan...' : t.loginModal.registerBtn}</span>
            </button>

            <div className="text-center pt-1">
              <span className="text-[12px] text-gray-500 dark:text-dark-muted">
                {t.loginModal.haveAccount}{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-[#12A889] hover:text-[#12A889] font-bold cursor-pointer hover:underline"
                >
                  {t.loginModal.logInLink}
                </button>
              </span>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <div className="space-y-3">
            {resetSent ? (
              <div className="text-center space-y-3 py-2">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-gray-900 dark:text-dark-text">
                    {t.loginModal.resetSuccessTitle}
                  </h3>
                  <p className="text-[12px] text-gray-500 dark:text-dark-muted leading-relaxed px-2">
                    {t.loginModal.resetSuccessMsg}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="w-full bg-[#12A889] hover:bg-[#12A889] text-white font-bold py-2.5 rounded-xl transition-all text-[13px] cursor-pointer"
                >
                  {t.loginModal.backToLogin}
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-dark-muted uppercase mb-0.5">
                    {t.loginModal.emailOrUsername}
                  </label>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.loginModal.emailPlaceholder}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-[13px] text-charcoal dark:text-dark-text focus:outline-none focus:border-[#12A889] transition-colors"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#12A889] to-blue-600 hover:opacity-95 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-[13px] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>{isLoading ? 'Mengirim...' : t.loginModal.sendResetBtn}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    className="text-[12px] text-[#12A889] hover:text-[#12A889] font-bold cursor-pointer hover:underline inline-block"
                  >
                    {t.loginModal.backToLogin}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="text-center text-[11px] text-gray-400 dark:text-dark-muted border-t border-gray-100 dark:border-dark-border pt-2.5">
          {lang === 'id' ? 'Terhubung dengan aman ke Database Supabase' : 'Securely connected to Supabase Database'}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
