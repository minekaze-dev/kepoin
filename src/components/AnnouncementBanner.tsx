import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { storage } from '../lib/storage';
import { Announcement } from '../types';

export const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const isLoggedIn = storage.getIsLoggedIn();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('kepoin_welcome_dismissed') === 'true';
  });

  useEffect(() => {
    const load = () => {
      const anns = storage.getAnnouncements().filter(a => a.active);
      setAnnouncements(anns);
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  // Do not show if logged in, or already dismissed in this browser
  if (isLoggedIn || dismissed || announcements.length === 0) return null;

  const current = announcements[0];

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('kepoin_welcome_dismissed', 'true');
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-[#12A889] via-teal-600 to-blue-600 rounded-3xl p-5 text-white shadow-xl shadow-[#12A889]/15 relative overflow-hidden flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="min-w-0 pr-2">
        <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white mb-1">
          {current.title}
        </h2>
        <p className="text-xs text-emerald-100 font-normal leading-relaxed">
          {current.content}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleDismiss}
          className="p-2 hover:bg-white/20 rounded-xl text-emerald-100 hover:text-white transition-colors cursor-pointer"
          title="Tutup"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

