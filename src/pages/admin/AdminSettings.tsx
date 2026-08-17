/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Globe, 
  Layers,
  Power
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { PlatformSettings } from '../../types';
import { initialPlatformSettings } from '../../data/adminData';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>(storage.getPlatformSettings());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSettings(storage.getPlatformSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.savePlatformSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan semua pengaturan sistem ke pengaturan default?')) {
      storage.savePlatformSettings(initialPlatformSettings);
      setSettings(initialPlatformSettings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Pengaturan Sistem & Platform (Settings)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi nama platform, masa kedaluwarsa 3 hari, mode pemeliharaan (maintenance), dan limitasi sistem.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 size={15} />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Nama Platform & Identitas */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5">
            <Globe size={18} className="text-orange-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Nama Platform & Identitas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nama Platform
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#12A889]"
                placeholder="Kepoin"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status Registrasi Pengguna Baru
              </label>
              <select
                value={settings.allowPublicRegistration ? 'true' : 'false'}
                onChange={(e) => setSettings({ ...settings, allowPublicRegistration: e.target.value === 'true' })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#12A889] cursor-pointer"
              >
                <option value="true">Buka (Semua orang dapat mendaftar)</option>
                <option value="false">Tutup (Hanya akun yang ada)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Maintenance Mode */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Power size={18} className={settings.maintenanceMode ? 'text-red-400' : 'text-slate-400'} />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Maintenance Mode (Mode Pemeliharaan)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bila diaktifkan, pengguna umum akan melihat pesan pemeliharaan sistem saat mengakses website.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${
                settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.maintenanceMode ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {settings.maintenanceMode && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-red-300 uppercase tracking-wider">
                Pesan Pemeliharaan untuk Pengunjung:
              </label>
              <textarea
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                rows={2}
                className="w-full p-3 bg-slate-950 border border-red-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-red-400 resize-none"
              />
            </div>
          )}
        </div>

        {/* 3. Expiration Rule (3-Day Expiration) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5">
            <Clock size={18} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Default Expiration (Kedaluwarsa Asks)
            </h2>
          </div>

          <p className="text-xs text-slate-400">
            Atur masa aktif default untuk setiap Ask baru sebelum diarsipkan otomatis. (Standar: 3 Hari / 72 Jam).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 3, 7].map((days) => (
              <button
                type="button"
                key={days}
                onClick={() => setSettings({ ...settings, defaultExpirationDays: days })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  settings.defaultExpirationDays === days
                    ? 'border-[#12A889] bg-[#12A889]/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <p className="text-sm font-black text-white">{days} Hari ({days * 24} Jam)</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {days === 3 ? 'Rekomendasi Kepoin (3-Day Drop)' : `${days} hari masa aktif publik`}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Default Limits & Moderation Controls */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5">
            <Layers size={18} className="text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4. Default Limits & Moderation Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Maksimal Jawaban per Ask (Max Responses)
              </label>
              <input
                type="number"
                min="50"
                max="5000"
                step="50"
                value={settings.maxResponsesPerDrop}
                onChange={(e) => setSettings({ ...settings, maxResponsesPerDrop: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#12A889]"
              />
              <p className="text-[11px] text-slate-500">Mencegah overload database dan spam jawaban.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Izin Pengiriman Anonim Secara Global
              </label>
              <select
                value={settings.allowAnonymousGlobal ? 'true' : 'false'}
                onChange={(e) => setSettings({ ...settings, allowAnonymousGlobal: e.target.value === 'true' })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#12A889] cursor-pointer"
              >
                <option value="true">Diizinkan (Pengguna/Tamu dapat mengirim secara anonim)</option>
                <option value="false">Wajib Akun (Menonaktifkan anonim global)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            <RotateCcw size={14} />
            <span>Reset ke Default</span>
          </button>

          <button
            type="submit"
            className="px-6 py-3 bg-[#12A889] hover:bg-[#12A889] text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#12A889]/25 cursor-pointer"
          >
            <Save size={15} />
            <span>Simpan Perubahan Sistem</span>
          </button>
        </div>
      </form>
    </div>
  );
};
