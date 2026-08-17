/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight, ArrowLeft, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { storage } from '../../lib/storage';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await storage.loginAsAdmin(identifier, password);
      if (success) {
        navigate('/admin');
      } else {
        setError('Kredensial admin tidak valid. Pastikan akun memiliki hak akses Administrator.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal login sebagai admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-[#12A889] selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#12A889]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Back to main site */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Kembali ke Kepoin
        </button>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#12A889] to-amber-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-[#12A889]/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Kepoin Control Center
            </h1>
            <p className="text-xs text-slate-400">
              Autentikasi Administrator & Moderasi Terintegrasi Supabase
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Email / Username Admin
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError('');
                  }}
                  placeholder="admin@kepoin.app atau username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-[#12A889] text-white placeholder:text-slate-600 transition-colors"
                  required
                  autoFocus
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Password Admin
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Masukkan password admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-[#12A889] text-white placeholder:text-slate-600 transition-colors"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#12A889] to-amber-500 hover:from-[#12A889] hover:to-amber-600 text-white rounded-xl text-sm font-bold shadow-md shadow-[#12A889]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{loading ? 'Memverifikasi Akses...' : 'Masuk ke Panel Admin'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-600">
          Sistem Pengawasan & Moderasi Kepoin © 2026 • Terhubung ke Supabase
        </p>
      </div>
    </div>
  );
};
