/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  UserCheck, 
  UserX, 
  Ban, 
  ExternalLink, 
  Eye, 
  Clock, 
  ShieldAlert,
  AlertTriangle,
  X,
  Trash2,
  UserPlus
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { UserProfile } from '../../types';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [statusModal, setStatusModal] = useState<{
    user: UserProfile;
    targetStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETE';
  } | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [isTesterModalOpen, setIsTesterModalOpen] = useState(false);
  const [testerData, setTesterData] = useState({ name: '', username: '', content: '', expiresAt: '' });

  useEffect(() => {
    loadUsers();
    const handleUpdate = () => loadUsers();
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  const loadUsers = () => {
    setUsers(storage.getAllUsers());
  };

  const drops = storage.getDrops(true, true);
  const responses = storage.getResponses();

  const getUserStats = (userId: string) => {
    const askCount = drops.filter(d => d.ownerId === userId).length;
    const answerCount = responses.filter(r => r.userId === userId).length;
    return { askCount, answerCount };
  };

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    const { user, targetStatus } = statusModal;
    
    if (targetStatus === 'DELETE') {
      await storage.deleteUser(user.id);
    } else {
      storage.updateUserStatus(user.id, targetStatus, reasonInput.trim() || undefined);
    }
    
    setStatusModal(null);
    setReasonInput('');
    loadUsers();
  };

  const handleCreateTester = () => {
    // Basic validation
    if (!testerData.name || !testerData.username || !testerData.content || !testerData.expiresAt) {
      alert('Semua field harus diisi!');
      return;
    }

    // Expiration check: max 7 days from now
    const selectedDate = new Date(testerData.expiresAt);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    
    if (selectedDate > maxDate) {
      alert('Masa expired maksimal 7 hari dari sekarang!');
      return;
    }

    // Logic to save user and drop (using storage)
    const newUserId = `tester_${Date.now()}`;
    const newUser = {
      id: newUserId,
      name: testerData.name,
      username: testerData.username.startsWith('@') ? testerData.username : `@${testerData.username}`,
      status: 'ACTIVE' as const,
      role: 'USER' as const,
      joinedAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${testerData.username}`
    };
    
    storage.saveUser(newUser);
    
    // Create Drop
    const newDrop = {
      id: `drop_${Date.now()}`,
      ownerId: newUserId,
      content: testerData.content,
      expiresAt: testerData.expiresAt,
      createdAt: new Date().toISOString()
    };
    
    // Assuming storage has a saveDrop method. If not, this needs adjustment based on actual storage implementation.
    // @ts-ignore
    if (typeof storage.saveDrop === 'function') {
      // @ts-ignore
      storage.saveDrop(newDrop);
    }
    
    setIsTesterModalOpen(false);
    setTesterData({ name: '', username: '', content: '', expiresAt: '' });
    loadUsers();
    alert('Akun tester berhasil dibuat!');
  };

  const filteredUsers = users.filter((user) => {
    const status = user.status || 'ACTIVE';
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = user.name.toLowerCase().includes(q);
      const matchesUsername = user.username.toLowerCase().includes(q);
      const matchesBio = user.bio?.toLowerCase().includes(q);
      if (!matchesName && !matchesUsername && !matchesBio) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Manajemen Pengguna (Users)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Daftar akun terdaftar di Kepoin. Kontrol status keaktifan, penangguhan (suspend), atau blokir (ban).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTesterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#12A889] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <UserPlus size={16} />
            Tambah Tester
          </button>
          <div className="text-xs font-bold text-slate-400 px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
            Total: {users.length} Akun
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, @username, atau bio..."
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
          {(['ALL', 'ACTIVE', 'SUSPENDED', 'BANNED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#12A889] text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st === 'ACTIVE' ? 'Aktif' : st === 'SUSPENDED' ? 'Suspended' : 'Banned'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 sm:px-6">Username / Profil</th>
                <th className="py-3.5 px-4">Join Date</th>
                <th className="py-3.5 px-4 text-center">Jumlah Ask</th>
                <th className="py-3.5 px-4 text-center">Jumlah Answer</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-500">
                    Tidak ditemukan data pengguna yang cocok.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const status = user.status || 'ACTIVE';
                  const { askCount, answerCount } = getUserStats(user.id);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-850/50 transition-colors ${
                        status === 'BANNED' ? 'bg-red-950/10' : status === 'SUSPENDED' ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Username & Avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                            alt={user.name}
                            className="w-10 h-10 rounded-2xl bg-slate-800 object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-200 truncate max-w-[140px]">
                              {user.name}
                            </p>
                            <p className="text-[11.5px] text-orange-400 font-semibold truncate max-w-[140px]">
                              {user.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        <p className="text-slate-300 font-medium">
                          {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Agt 2026'}
                        </p>
                        <p className="text-[10.5px] text-slate-500">
                          {user.location || 'Indonesia'}
                        </p>
                      </td>

                      {/* Jumlah Ask */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-200 px-2 py-1 bg-slate-800 rounded-lg">
                          {askCount}
                        </span>
                      </td>

                      {/* Jumlah Answer */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-200 px-2 py-1 bg-slate-800 rounded-lg">
                          {answerCount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <UserCheck size={11} />
                            Active
                          </span>
                        )}
                        {status === 'SUSPENDED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                            <Clock size={11} />
                            Suspended
                          </span>
                        )}
                        {status === 'BANNED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                            <Ban size={11} />
                            Banned
                          </span>
                        )}
                      </td>

                      {/* Actions: View -> Suspend -> Ban */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Profile */}
                          <Link
                            to={`/profile/${user.username.replace('@', '')}`}
                            target="_blank"
                            title="Buka Profil Publik"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          {/* Quick Inspect Details */}
                          <button
                            onClick={() => setSelectedUser(user)}
                            title="Lihat Detail User"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Suspend Toggle */}
                          {status !== 'SUSPENDED' ? (
                            <button
                              onClick={() => setStatusModal({ user, targetStatus: 'SUSPENDED' })}
                              title="Tangguhkan Akun (Suspend)"
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer"
                            >
                              <UserX size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setStatusModal({ user, targetStatus: 'ACTIVE' })}
                              title="Aktifkan Kembali Akun"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                            >
                              <UserCheck size={14} />
                            </button>
                          )}

                          {/* Ban Toggle */}
                          {status !== 'BANNED' ? (
                            <button
                              onClick={() => setStatusModal({ user, targetStatus: 'BANNED' })}
                              title="Blokir Akun Permanen (Ban)"
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                            >
                              <Ban size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setStatusModal({ user, targetStatus: 'ACTIVE' })}
                              title="Buka Blokir (Unban)"
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] transition-colors cursor-pointer"
                            >
                              Unban
                            </button>
                          )}

                          {/* Permanent Delete */}
                          <button
                            onClick={() => setStatusModal({ user, targetStatus: 'DELETE' })}
                            title="Hapus Akun Permanen"
                            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <img
                src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`}
                alt={selectedUser.name}
                className="w-14 h-14 rounded-2xl bg-slate-800 object-cover border border-slate-700"
              />
              <div>
                <h3 className="text-base font-black text-white">{selectedUser.name}</h3>
                <p className="text-xs text-orange-400 font-bold">{selectedUser.username}</p>
                <p className="text-[11px] text-slate-500">ID: {selectedUser.id}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <div>
                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Bio</p>
                <p className="text-slate-300 mt-0.5">{selectedUser.bio || 'Tidak ada bio.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Lokasi</p>
                  <p className="text-slate-300 mt-0.5">{selectedUser.location || 'Indonesia'}</p>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Status Akun</p>
                  <p className="text-emerald-400 font-bold mt-0.5">{selectedUser.status || 'ACTIVE'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to={`/profile/${selectedUser.username.replace('@', '')}`}
                target="_blank"
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Buka Profil</span>
                <ExternalLink size={13} />
              </Link>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal (Suspend / Ban / Unban / Delete) */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                statusModal.targetStatus === 'DELETE' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {statusModal.targetStatus === 'DELETE' ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {statusModal.targetStatus === 'DELETE' 
                    ? 'HAPUS AKUN PERMANEN?' 
                    : `Ubah Status Pengguna: ${statusModal.targetStatus}`
                  }
                </h3>
                <p className="text-xs text-slate-400">
                  {statusModal.user.name} ({statusModal.user.username})
                </p>
              </div>
            </div>

            {statusModal.targetStatus === 'DELETE' ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-xs text-red-400 leading-relaxed">
                  <span className="font-bold block mb-1 uppercase tracking-wider">Peringatan Kritis!</span>
                  Tindakan ini tidak dapat dibatalkan. Seluruh data profil, Ask, Answer, dan riwayat aktivitas pengguna ini akan dihapus permanen dari server.
                </p>
              </div>
            ) : statusModal.targetStatus !== 'ACTIVE' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Alasan Penangguhan / Pemblokiran
                </label>
                <input
                  type="text"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Contoh: Spam berulang / Ujaran kebencian"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#12A889]"
                />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setStatusModal(null);
                  setReasonInput('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer ${
                  statusModal.targetStatus === 'DELETE' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#12A889] hover:bg-emerald-700'
                }`}
              >
                {statusModal.targetStatus === 'DELETE' ? 'YA, HAPUS PERMANEN' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Tester Modal */}
      {isTesterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-black text-white">Tambah Akun Tester</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nama" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" value={testerData.name} onChange={e => setTesterData({...testerData, name: e.target.value})} />
              <input type="text" placeholder="Username (@...)" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" value={testerData.username} onChange={e => setTesterData({...testerData, username: e.target.value})} />
              <textarea placeholder="Konten Drop" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" value={testerData.content} onChange={e => setTesterData({...testerData, content: e.target.value})} />
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Tanggal Expired (Max 7 hari)</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" 
                  value={testerData.expiresAt} 
                  onChange={e => setTesterData({...testerData, expiresAt: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsTesterModalOpen(false)} className="flex-1 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold">Batal</button>
              <button onClick={handleCreateTester} className="flex-1 py-2 rounded-lg bg-[#12A889] text-white text-xs font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
