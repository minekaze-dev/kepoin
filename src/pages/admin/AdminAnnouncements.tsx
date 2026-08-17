import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Edit3, X, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Announcement } from '../../types';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('UPDATE');

  useEffect(() => {
    loadAnnouncements();
    const handleUpdate = () => loadAnnouncements();
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  const loadAnnouncements = () => {
    setAnnouncements(storage.getAnnouncements());
  };

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setTitle('');
    setContent('');
    setCategory('UPDATE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setTitle(ann.title);
    setContent(ann.content);
    setCategory(ann.category);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingAnnouncement) {
      const updated: Announcement = {
        ...editingAnnouncement,
        title,
        content,
        category,
      };
      storage.updateAnnouncement(updated);
    } else {
      const newAnn: Announcement = {
        id: 'ann_' + Math.random().toString(36).substr(2, 9),
        title,
        content,
        category,
        createdAt: new Date().toISOString(),
        active: true,
        adminName: 'Admin Kepoin',
      };
      storage.saveAnnouncement(newAnn);
    }

    setIsModalOpen(false);
    loadAnnouncements();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus pengumuman ini?')) return;
    storage.deleteAnnouncement(id);
    loadAnnouncements();
  };

  const handleToggleActive = (id: string) => {
    storage.toggleAnnouncementActive(id);
    loadAnnouncements();
  };

  const getCategoryBadge = (cat: Announcement['category']) => {
    switch (cat) {
      case 'UPDATE':
        return <span className="bg-[#12A889]/10 text-orange-400 border border-[#12A889]/30 px-2.5 py-0.5 rounded-full text-[10px] font-black">UPDATE</span>;
      case 'WARNING':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black">WARNING</span>;
      case 'EVENT':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black">EVENT</span>;
      default:
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black">INFO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#12A889]/10 text-orange-400 border border-[#12A889]/20">
              <Megaphone size={18} />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Papan Pengumuman & Berita KEPOIN
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Buat pengumuman penting yang akan tampil sebagai notifikasi dan banner informatif untuk seluruh pengguna.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#12A889] hover:bg-[#12A889] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#12A889]/25 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between transition-all ${
              ann.active ? 'border-slate-800 shadow-xl' : 'border-slate-800/50 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryBadge(ann.category)}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${ann.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-slate-800 text-slate-400'}`}>
                    {ann.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm tracking-tight mb-2">
                {ann.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {ann.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500 font-medium">
                Oleh: {ann.adminName}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(ann.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                    ann.active
                      ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                  }`}
                >
                  {ann.active ? 'Sembunyikan' : 'Tampilkan'}
                </button>

                <button
                  onClick={() => handleOpenEdit(ann)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="Edit Pengumuman"
                >
                  <Edit3 size={15} />
                </button>

                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer"
                  title="Hapus Pengumuman"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-[#12A889]/10 text-orange-400 rounded-xl border border-[#12A889]/20">
                  <Megaphone size={18} />
                </span>
                <h3 className="text-lg font-black text-white tracking-tight">
                  {editingAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl border border-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Kategori Pengumuman
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Announcement['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#12A889]"
                >
                  <option value="UPDATE">UPDATE (Pembaruan Fitur)</option>
                  <option value="INFO">INFO (Informasi Umum)</option>
                  <option value="EVENT">EVENT (Acara & Komunitas)</option>
                  <option value="WARNING">WARNING (Penting / Perhatian)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: ✨ Rilis Fitur This or That!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#12A889]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Isi Pengumuman / Pesan
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan informasi lengkap untuk para pengguna KEPOIN..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#12A889] resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-750 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#12A889] hover:bg-[#12A889] text-white text-xs font-bold shadow-lg shadow-[#12A889]/25 transition-all cursor-pointer"
                >
                  {editingAnnouncement ? 'Simpan Perubahan' : 'Publikasikan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
