/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { DropBoard } from '../types';
import { useLanguage } from '../lib/i18n';

export const Discover = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [drops, setDrops] = useState<DropBoard[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('Trending');

  const [visibleCount, setVisibleCount] = useState(9);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(9);
  }, [search, activeTab, sortBy]);

  useEffect(() => {
    setDrops(storage.getDrops());
  }, []);

  const tabs = [
    { key: 'All', label: t.discover.tabs.all },
    { key: 'Trending', label: t.discover.tabs.trending },
    { key: 'PHOTO', label: t.create.types.PHOTO },
    { key: 'TEXT', label: t.create.types.TEXT },
    { key: 'CHOICE', label: t.create.types.CHOICE },
    { key: 'NUMBER', label: t.create.types.NUMBER },
    { key: 'PLACE', label: t.create.types.PLACE }
  ];
  
  const filteredDrops = drops.filter(drop => {
    const matchesSearch = drop.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'All' || activeTab === 'Trending' || drop.type === activeTab;
    return matchesSearch && matchesTab;
  }).sort((a, b) => {
    if (sortBy === 'Trending' || activeTab === 'Trending') {
      const respA = storage.getResponses(a.id).length;
      const respB = storage.getResponses(b.id).length;
      return ((b.stats?.views || 0) + respB * 5) - ((a.stats?.views || 0) + respA * 5);
    }
    if (sortBy === 'Newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'Most Kepoan') return storage.getResponses(b.id).length - storage.getResponses(a.id).length;
    return 0;
  });

  const getTotalTalks = (dropId: string) => {
    return storage.getResponses(dropId).reduce((acc, r) => acc + (r.talks?.length || 0), 0);
  };

  const getDropPreviewData = (drop: DropBoard) => {
    const responses = storage.getResponses(drop.id);
    if (drop.type === 'PHOTO') {
      const photos = responses.map(r => String(r.content)).filter(c => c.startsWith('http') || c.startsWith('data:'));
      return { type: 'PHOTO', photos: photos.slice(0, 3), totalPhotos: photos.length };
    }
    if (drop.type === 'SONG') {
      const topSong = responses[0]?.content;
      return { type: 'SONG', song: topSong ? String(topSong) : null };
    }
    if (drop.type === 'PLACE') {
      const topPlace = responses[0]?.content;
      return { type: 'PLACE', place: topPlace ? String(topPlace) : null };
    }
    if (drop.type === 'NUMBER') {
      const nums = responses.map(r => typeof r.content === 'number' ? r.content : parseFloat(String(r.content))).filter(n => !isNaN(n));
      const sample = responses[0]?.content;
      return { type: 'NUMBER', sample: sample !== undefined ? String(sample) : null, count: nums.length };
    }
    if (drop.type === 'CHOICE') {
      return { type: 'CHOICE', options: drop.settings?.options || [] };
    }
    // TEXT
    const topText = responses[0]?.content;
    return { type: 'TEXT', text: topText ? String(topText) : null };
  };

  return (
    <div className="space-y-6">
      <Header title={t.discover.header} subtitle={t.discover.subtitle} showSearch={false} />

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted" size={18} />
          <input 
            type="text" 
            placeholder={t.discover.searchPlaceholder}
            className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select 
              className="appearance-none bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-lg pl-4 pr-10 py-2.5 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Trending">{t.discover.sort.trending}</option>
              <option value="Newest">{t.discover.sort.newest}</option>
              <option value="Most Kepoan">{t.discover.sort.most}</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-medium transition-all
              ${activeTab === tab.key 
                ? 'bg-charcoal dark:bg-[#12A889] text-white' 
                : 'bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-gray-500 dark:text-dark-muted hover:border-gray-200 dark:hover:border-dark-muted'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrops.slice(0, visibleCount).map((drop) => {
          const isTrendingCard = activeTab === 'Trending';
          const preview = getDropPreviewData(drop);
          
          return (
            <Link 
              key={drop.id}
              to={`/drop/${drop.slug}`}
              className={`
                relative p-4 rounded-xl transition-all group flex flex-col h-full overflow-hidden
                ${isTrendingCard 
                  ? 'bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-[#12A889]/30 hover:border-orange-400 dark:hover:border-[#12A889] hover:shadow-md'
                  : 'bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border hover:border-orange-200 dark:hover:border-[#12A889]/50 hover:shadow-md'}
              `}
            >
              <div className="flex justify-between items-start mb-2.5">
                <span className={`
                  px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                  ${isTrendingCard ? 'bg-orange-200/50 dark:bg-[#12A889]/30 text-orange-700 dark:text-orange-400' : 'bg-orange-50 dark:bg-[#12A889]/10 text-[#12A889] dark:text-[#12A889]'}
                `}>
                  {t.create.types[drop.type.toUpperCase() as keyof typeof t.create.types] || drop.type}
                </span>
                <span className={`text-[11px] flex gap-1.5 items-center ${isTrendingCard ? 'text-orange-700/70 dark:text-orange-300/70 font-medium' : 'text-gray-400 dark:text-dark-muted'}`}>
                  <span>{storage.getResponses(drop.id).length} {lang === 'en' ? (storage.getResponses(drop.id).length === 1 ? 'answer' : 'answers') : 'jawaban'}</span>
                  <span>·</span>
                  <span>{getTotalTalks(drop.id)} {lang === 'en' ? (getTotalTalks(drop.id) === 1 ? 'talk' : 'talks') : 'obrolan'}</span>
                </span>
              </div>
              <h3 className={`
                font-bold text-[15px] mb-2.5 transition-colors leading-snug
                ${isTrendingCard ? 'text-orange-950 dark:text-orange-100 group-hover:text-[#12A889]' : 'group-hover:text-[#12A889] dark:text-dark-text'}
              `}>
                {drop.prompt}
              </h3>

              {/* Rich Visual Content Previews */}
              {preview.type === 'PHOTO' && preview.photos && preview.photos.length > 0 && (
                <div className="flex items-center gap-1.5 mb-3 overflow-hidden">
                  {preview.photos.map((imgUrl, idx) => (
                    <div key={idx} className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-dark-bg overflow-hidden shrink-0 border border-gray-100 dark:border-dark-border">
                      <img 
                        src={imgUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=150&h=150&fit=crop';
                        }}
                      />
                    </div>
                  ))}
                  {preview.totalPhotos > preview.photos.length && (
                    <div className="w-10 h-14 rounded-lg bg-gray-50 dark:bg-dark-bg/60 border border-gray-100 dark:border-dark-border flex items-center justify-center text-[11px] font-bold text-gray-500">
                      +{preview.totalPhotos - preview.photos.length}
                    </div>
                  )}
                </div>
              )}

              {preview.type === 'SONG' && preview.song && (
                <div className="mb-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                  <span className="text-[14px]">🎧</span>
                  <span className="text-[12px] font-medium text-rose-800 dark:text-rose-300 truncate">
                    {preview.song}
                  </span>
                </div>
              )}

              {preview.type === 'PLACE' && preview.place && (
                <div className="mb-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                  <span className="text-[14px]">📍</span>
                  <span className="text-[12px] font-medium text-emerald-800 dark:text-emerald-300 truncate">
                    {preview.place}
                  </span>
                </div>
              )}

              {preview.type === 'NUMBER' && preview.sample && (
                <div className="mb-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                  <span className="text-[14px]">🔢</span>
                  <span className="text-[12px] font-semibold text-amber-800 dark:text-amber-300 truncate">
                    {isNaN(Number(preview.sample)) ? preview.sample : Number(preview.sample) >= 1000 ? `Rp ${Number(preview.sample).toLocaleString()}` : `${preview.sample}`}
                  </span>
                </div>
              )}

              {preview.type === 'TEXT' && preview.text && (
                <div className="mb-3 bg-gray-50 dark:bg-dark-bg/60 border border-gray-100 dark:border-dark-border rounded-lg px-2.5 py-1.5 text-[12px] text-gray-600 dark:text-dark-muted line-clamp-2 italic">
                  "{preview.text}"
                </div>
              )}

              {preview.type === 'CHOICE' && preview.options && preview.options.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {preview.options.map((opt, i) => (
                    <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-[#12A889]/10 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-[#12A889]/20">
                      {opt}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 mt-auto">
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const user = storage.getUserById(drop.ownerId);
                    if (user) navigate(`/profile/${user.username.replace('@', '')}`);
                  }}
                  className="flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 -ml-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 border border-gray-100">
                    <img src={storage.getUserById(drop.ownerId)?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${drop.ownerId}`} alt="creator" />
                  </div>
                  <span className="text-[12px] font-medium text-gray-500 dark:text-dark-muted truncate max-w-[120px]">
                    {t.public.createdBy} {storage.getUserById(drop.ownerId)?.name || t.public.someone}
                  </span>
                </div>
              </div>
              <div className={`pt-2.5 border-t flex items-center justify-between ${isTrendingCard ? 'border-orange-200/50 dark:border-[#12A889]/30' : 'border-gray-50 dark:border-dark-border'}`}>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`w-5 h-5 rounded-full border-2 overflow-hidden ${isTrendingCard ? 'border-orange-50 dark:border-orange-900 bg-orange-100 dark:bg-orange-800' : 'border-white dark:border-dark-surface bg-gray-100 dark:bg-dark-bg'}`}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${drop.id + i}`} alt="user" />
                    </div>
                  ))}
                </div>
                <span className={`text-[12px] font-medium z-10 relative ${isTrendingCard ? 'text-orange-800 dark:text-orange-200' : 'text-charcoal dark:text-dark-text'}`}>{t.discover.viewBoard}</span>
              </div>
              
              {isTrendingCard && (
                <div className="absolute bottom-2.5 right-3 text-[#12A889] text-[18px] opacity-90 group-hover:scale-125 transition-transform duration-300 origin-bottom-right">
                  🔥
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {visibleCount < filteredDrops.length && (
        <div className="flex justify-center pt-4 pb-8">
          <button 
            onClick={() => setVisibleCount(v => v + 9)}
            className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-charcoal dark:text-dark-text hover:border-[#12A889] hover:text-[#12A889] px-8 py-3 rounded-xl text-[14px] font-bold transition-all shadow-sm"
          >
            {t.home.more || 'More'}
          </button>
        </div>
      )}

      {filteredDrops.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-400">{t.discover.noResults.replace('{search}', search)}</p>
        </div>
      )}
    </div>
  );
};
