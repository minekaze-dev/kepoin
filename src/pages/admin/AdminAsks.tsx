/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Trash2, 
  ExternalLink, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert,
  X
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { DropBoard, UserProfile } from '../../types';

export const AdminAsks: React.FC = () => {
  const [drops, setDrops] = useState<DropBoard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'HIDDEN'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedDrop, setSelectedDrop] = useState<DropBoard | null>(null);
  const [deleteConfirmDrop, setDeleteConfirmDrop] = useState<DropBoard | null>(null);

  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [choicePrompt, setChoicePrompt] = useState('');
  const [choiceDesc, setChoiceDesc] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');

  useEffect(() => {
    loadDrops();
    const handleUpdate = () => loadDrops();
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  const loadDrops = () => {
    setDrops(storage.getDrops(true, true));
  };

  const now = Date.now();

  const getDropStatus = (drop: DropBoard): 'ACTIVE' | 'EXPIRED' | 'HIDDEN' => {
    if (drop.isHidden) return 'HIDDEN';
    if (drop.status === 'EXPIRED') return 'EXPIRED';
    if (drop.expiresAt && new Date(drop.expiresAt).getTime() < now) return 'EXPIRED';
    if (drop.isGuest && (now - new Date(drop.createdAt).getTime()) > 3600 * 1000) return 'EXPIRED';
    return 'ACTIVE';
  };

  const handleToggleHide = (drop: DropBoard) => {
    storage.toggleHideDrop(drop.id);
    loadDrops();
  };

  const handleDelete = (dropId: string) => {
    storage.deleteDropByAdmin(dropId);
    setDeleteConfirmDrop(null);
    setSelectedDrop(null);
    loadDrops();
  };

  const handleOpenChoiceModal = () => {
    const daily = storage.getDailyThisOrThat();
    setChoicePrompt(daily.prompt);
    setOptionA(daily.optionA);
    setOptionB(daily.optionB);
    setIsChoiceModalOpen(true);
  };

  const handleSaveDailyChoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!choicePrompt.trim() || !optionA.trim() || !optionB.trim()) return;
    const daily = storage.getDailyThisOrThat();
    storage.updateDailyThisOrThat({
      ...daily,
      prompt: choicePrompt,
      optionA,
      optionB,
      updatedAt: new Date().toISOString()
    });
    setIsChoiceModalOpen(false);
  };

  // Filter drops
  const filteredDrops = drops.filter((drop) => {
    const status = getDropStatus(drop);
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && drop.type !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const owner = storage.getUserById(drop.ownerId);
      const matchesPrompt = drop.prompt.toLowerCase().includes(q);
      const matchesCategory = drop.category?.toLowerCase().includes(q);
      const matchesOwner = owner?.name.toLowerCase().includes(q) || owner?.username.toLowerCase().includes(q);
      if (!matchesPrompt && !matchesCategory && !matchesOwner) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Manajemen Asks (Drops)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kontrol seluruh pertanyaan dan postingan di Kepoin. Sembunyikan konten melanggar atau hapus permanen.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs font-bold text-slate-400">
            Total: {drops.length} Asks
          </span>
          <button
            onClick={handleOpenChoiceModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#12A889] hover:bg-[#12A889] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#12A889]/25 transition-all cursor-pointer"
          >
            <span>✨ Kelola This or That Harian</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul Ask, kategori, atau nama user..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#12A889]"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-500" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'ACTIVE', 'EXPIRED', 'HIDDEN'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#12A889] text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st === 'ACTIVE' ? 'Aktif' : st === 'EXPIRED' ? 'Expired' : 'Hidden'}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#12A889] cursor-pointer"
        >
          <option value="ALL">Semua Tipe</option>
          <option value="TEXT">TEXT</option>
          <option value="PHOTO">PHOTO</option>
          <option value="NUMBER">NUMBER</option>
          <option value="PLACE">PLACE</option>
          <option value="SONG">SONG</option>
          <option value="CHOICE">CHOICE</option>
        </select>
      </div>

      {/* Asks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 sm:px-6">User / Pembuat</th>
                <th className="py-3.5 px-4">Isi Ask (Prompt)</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4 text-center">Answers</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredDrops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-500">
                    Tidak ditemukan data Ask yang cocok.
                  </td>
                </tr>
              ) : (
                filteredDrops.map((drop) => {
                  const status = getDropStatus(drop);
                  const owner = storage.getUserById(drop.ownerId);
                  const respCount = storage.getResponses(drop.id).length;

                  return (
                    <tr
                      key={drop.id}
                      className={`hover:bg-slate-850/50 transition-colors ${
                        drop.isHidden ? 'bg-red-950/10' : ''
                      }`}
                    >
                      {/* User */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={owner?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${drop.ownerId}`}
                            alt={owner?.name || 'User'}
                            className="w-9 h-9 rounded-xl bg-slate-800 object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-200 truncate max-w-[130px]">
                              {owner?.name || (drop.isGuest ? 'Guest User' : 'Pengguna')}
                            </p>
                            <p className="text-[11px] text-orange-400 truncate max-w-[130px]">
                              {owner?.username || '@anon'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Isi Ask */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded bg-[#12A889]/10 text-orange-400 uppercase tracking-wider">
                              {drop.type}
                            </span>
                            {drop.category && (
                              <span className="text-[10px] text-slate-400">
                                #{drop.category}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                            {drop.prompt}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            /drop/{drop.slug}
                          </p>
                        </div>
                      </td>

                      {/* Waktu */}
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        <p className="text-[11.5px] text-slate-300 font-medium">
                          {new Date(drop.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10.5px] text-slate-500">
                          {drop.expiresAt ? `Exp: ${new Date(drop.expiresAt).toLocaleDateString()}` : '3 hari'}
                        </p>
                      </td>

                      {/* Answers Count */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-black text-slate-200 px-2 py-1 bg-slate-800 rounded-lg">
                          {respCount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={11} />
                            Active
                          </span>
                        )}
                        {status === 'EXPIRED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                            <Clock size={11} />
                            Expired
                          </span>
                        )}
                        {status === 'HIDDEN' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                            <EyeOff size={11} />
                            Hidden
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Drop */}
                          <Link
                            to={`/drop/${drop.slug}`}
                            target="_blank"
                            title="Buka Halaman Ask"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          {/* Toggle Hide */}
                          <button
                            onClick={() => handleToggleHide(drop)}
                            title={drop.isHidden ? 'Tampilkan kembali Ask' : 'Sembunyikan Ask dari publik'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              drop.isHidden
                                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            {drop.isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmDrop(drop)}
                            title="Hapus Ask Permanen"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Hapus Ask Secara Permanen?
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tindakan ini akan menghapus Ask <span className="text-white font-bold">"{deleteConfirmDrop.prompt}"</span> beserta seluruh jawaban dan interaksi di dalamnya secara permanen.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmDrop(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmDrop.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md shadow-red-600/20 cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Daily This or That Modal */}
      {isChoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-[#12A889]/10 text-orange-400 rounded-xl border border-[#12A889]/20">
                  🗳️
                </span>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Atur This or That Harian (Beranda)
                </h3>
              </div>
              <button
                onClick={() => setIsChoiceModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl border border-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveDailyChoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Pertanyaan Utama (Prompt)
                </label>
                <input
                  type="text"
                  required
                  value={choicePrompt}
                  onChange={(e) => setChoicePrompt(e.target.value)}
                  placeholder="Contoh: Kopi Kenangan vs Kopi Tuku?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#12A889]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Pilihan A (This)
                  </label>
                  <input
                    type="text"
                    required
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="Contoh: ☕ Kopi Kenangan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#12A889]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Pilihan B (That)
                  </label>
                  <input
                    type="text"
                    required
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="Contoh: 🥛 Kopi Tuku"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#12A889]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChoiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-750 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#12A889] hover:bg-[#12A889] text-white text-xs font-bold shadow-lg shadow-[#12A889]/25 transition-all cursor-pointer"
                >
                  Simpan & Perbarui Harian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
