import React, { useState, useEffect } from 'react';
import { Megaphone, X, Sparkles, AlertCircle, Info } from 'lucide-react';
import { storage } from '../lib/storage';
import { Announcement } from '../types';

export const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const load = () => {
      const anns = storage.getAnnouncements().filter(a => a.active);
      setAnnouncements(anns);
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const activeAnns = announcements.filter(a => !dismissedIds.includes(a.id));

  if (activeAnns.length === 0) return null;

  const current = activeAnns[0];

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-[#12A889] via-emerald-600 to-[#12A889] rounded-3xl p-4 sm:p-5 text-white shadow-xl shadow-[#12A889]/15 relative overflow-hidden flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-white shadow-inner">
          <Megaphone size={20} className="animate-bounce" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              {current.category}
            </span>
            <span className="text-[11px] font-medium text-emerald-100">
              {current.adminName}
            </span>
          </div>
          <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white line-clamp-1">
            {current.title}
          </h2>
          <p className="text-xs text-emerald-100 line-clamp-2 mt-0.5 font-normal">
            {current.content}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => handleDismiss(current.id)}
          className="p-2 hover:bg-white/20 rounded-xl text-emerald-100 hover:text-white transition-colors cursor-pointer"
          title="Tutup Pengumuman"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
