/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  X, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  Zap,
  Sliders
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { censorProfanity, containsBlockedWords, maskWord } from '../../lib/profanity';
import { ModerationConfig, DropBoard, DropResponse, UserProfile } from '../../types';

export const AdminModeration: React.FC = () => {
  const [config, setConfig] = useState<ModerationConfig>(storage.getModerationConfig());
  const [newCensorWord, setNewCensorWord] = useState('');
  const [newBlockedWord, setNewBlockedWord] = useState('');
  const [testInput, setTestInput] = useState('halo kamu goblok banget ya, tapi seru');
  const [drops, setDrops] = useState<DropBoard[]>([]);
  const [responses, setResponses] = useState<DropResponse[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadAll();
    const handleUpdate = () => loadAll();
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  const loadAll = () => {
    setConfig(storage.getModerationConfig());
    setDrops(storage.getDrops(true, true));
    setResponses(storage.getResponses());
    setUsers(storage.getAllUsers());
  };

  const handleAddCensorWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCensorWord.trim()) return;
    storage.addCensorWord(newCensorWord.trim());
    setNewCensorWord('');
    loadAll();
    flashSaved();
  };

  const handleRemoveCensorWord = (word: string) => {
    storage.removeCensorWord(word);
    loadAll();
    flashSaved();
  };

  const handleAddBlockedWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedWord.trim()) return;
    storage.addBlockedWord(newBlockedWord.trim());
    setNewBlockedWord('');
    loadAll();
    flashSaved();
  };

  const handleRemoveBlockedWord = (word: string) => {
    storage.removeBlockedWord(word);
    loadAll();
    flashSaved();
  };

  const handleToggleSpam = () => {
    const updated = {
      ...config,
      spamDetectionEnabled: !config.spamDetectionEnabled,
    };
    storage.saveModerationConfig(updated);
    loadAll();
    flashSaved();
  };

  const handleThresholdChange = (val: number) => {
    const updated = {
      ...config,
      spamThresholdPerMinute: val,
    };
    storage.saveModerationConfig(updated);
    loadAll();
    flashSaved();
  };

  const flashSaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Hidden content lists
  const hiddenDrops = drops.filter(d => d.isHidden);
  const hiddenResponses = responses.filter(r => r.isHidden);
  const bannedUsers = users.filter(u => u.status === 'BANNED' || config.bannedUserIds?.includes(u.id));

  // Live test results
  const testCensored = censorProfanity(testInput);
  const testBlockedCheck = containsBlockedWords(testInput);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Pengaturan Moderasi Otomatis & Sensor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi kata yang otomatis disensor (*), kata terlarang yang diblokir, dan kontrol konten tersembunyi.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 size={14} />
            <span>Tersimpan Otomatis</span>
          </div>
        )}
      </div>

      {/* Live Interactive Simulator */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Simulator Sensor & Filter
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Uji coba kata seperti "goblok", "anjing", atau kata custom
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Teks Masukan Uji Coba:
            </label>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Ketik kalimat apapun untuk melihat hasil sensor..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#12A889]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hasil Setelah Disensor Sistem:
            </label>
            <div className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-emerald-400 font-mono flex items-center justify-between">
              <span>{testCensored || <span className="text-slate-600">Teks kosong</span>}</span>
              {testBlockedCheck.blocked && (
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                  BLOCKED ({testBlockedCheck.word})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center gap-2 text-xs text-slate-400">
          <Zap size={14} className="text-orange-400 shrink-0" />
          <span>
            Contoh: Kata <strong className="text-white">goblok</strong> secara otomatis diubah menjadi <strong className="text-emerald-400">g*****</strong> secara real-time.
          </span>
        </div>
      </div>

      {/* Grid: Auto-censor Words & Blocked Words */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Auto Censor Words */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Kata yang Otomatis Disensor (*)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kata dalam daftar ini akan disamarkan dengan tanda bintang ({config.autoCensorWords.length} kata).
              </p>
            </div>
          </div>

          {/* Add form */}
          <form onSubmit={handleAddCensorWord} className="flex gap-2">
            <input
              type="text"
              value={newCensorWord}
              onChange={(e) => setNewCensorWord(e.target.value)}
              placeholder="Tambah kata sensor baru (cth: idiot)..."
              className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#12A889]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#12A889] hover:bg-[#12A889] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah</span>
            </button>
          </form>

          {/* Words Tags */}
          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1 bg-slate-950/40 rounded-2xl border border-slate-850">
            {config.autoCensorWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium"
              >
                <span>{word}</span>
                <span className="text-[10px] text-slate-500 font-mono">({maskWord(word)})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCensorWord(word)}
                  className="text-slate-400 hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 2. Blocked Words */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Kata yang Diblokir Total
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Postingan yang memuat kata ini akan dicegah atau ditolak oleh sistem ({config.blockedWords.length} kata).
              </p>
            </div>
          </div>

          {/* Add form */}
          <form onSubmit={handleAddBlockedWord} className="flex gap-2">
            <input
              type="text"
              value={newBlockedWord}
              onChange={(e) => setNewBlockedWord(e.target.value)}
              placeholder="Tambah kata terlarang (cth: judislot)..."
              className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Blokir</span>
            </button>
          </form>

          {/* Words Tags */}
          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1 bg-slate-950/40 rounded-2xl border border-slate-850">
            {config.blockedWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/30 text-red-300 border border-red-800/40 rounded-xl text-xs font-medium"
              >
                <span>{word}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBlockedWord(word)}
                  className="text-red-400 hover:text-white transition-colors ml-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Spam Detection & Banned Users / Hidden Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spam Detection Settings */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Spam Detection
            </h2>
            <button
              onClick={handleToggleSpam}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                config.spamDetectionEnabled ? 'bg-[#12A889]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  config.spamDetectionEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Mendeteksi pengiriman jawaban atau komentar berulang dalam rentang waktu singkat.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Batas respons per menit:</span>
              <span className="font-bold text-orange-400">{config.spamThresholdPerMinute} aksi / menit</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={config.spamThresholdPerMinute}
              onChange={(e) => handleThresholdChange(Number(e.target.value))}
              className="w-full accent-[#12A889] cursor-pointer"
            />
          </div>
        </div>

        {/* 4. Banned Users */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4. Banned Users
            </h2>
            <span className="text-xs font-bold text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
              {bannedUsers.length} Diblokir
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {bannedUsers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                Tidak ada user yang sedang dibanned.
              </div>
            ) : (
              bannedUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div className="min-w-0 text-xs">
                    <p className="font-bold text-slate-200 truncate">{user.name}</p>
                    <p className="text-[11px] text-orange-400 truncate">{user.username}</p>
                  </div>
                  <button
                    onClick={() => {
                      storage.unbanUser(user.id);
                      loadAll();
                    }}
                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Unban
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. Hidden Content */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              5. Hidden Content
            </h2>
            <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              {hiddenDrops.length + hiddenResponses.length} Item
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {hiddenDrops.length === 0 && hiddenResponses.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                Tidak ada konten yang disembunyikan.
              </div>
            ) : (
              <>
                {hiddenDrops.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 text-xs">
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#12A889]/10 text-orange-400 uppercase">
                        Ask
                      </span>
                      <p className="font-semibold text-slate-300 truncate mt-0.5">{d.prompt}</p>
                    </div>
                    <button
                      onClick={() => {
                        storage.toggleHideDrop(d.id, false);
                        loadAll();
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Unhide
                    </button>
                  </div>
                ))}

                {hiddenResponses.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 text-xs">
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
                        Answer
                      </span>
                      <p className="font-semibold text-slate-300 truncate mt-0.5">
                        {typeof r.content === 'string' ? r.content : 'Media/Pilihan'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        storage.toggleHideResponse(r.id, false);
                        loadAll();
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Unhide
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
