/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, ChevronRight, ChevronUp, ChevronDown, MoreVertical, Image, Trash2, Bookmark, User, Globe, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { DropBoard, ResponseType } from '../types';
import { motion } from 'motion/react';
import { NotificationBell } from '../components/NotificationBell';
import { AnnouncementBanner } from '../components/AnnouncementBanner';

import { useLanguage } from '../lib/i18n';
import { useTheme } from '../lib/theme';

export const Home = () => {
  const { t, lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // Daily Vote state
  const [dailyItem, setDailyItem] = useState(() => storage.getDailyThisOrThat());
  const [votedOption, setVotedOption] = useState<string | null>(() => localStorage.getItem(`daily_vote_${dailyItem.id}`));
  const [voteCounts, setVoteCounts] = useState({ 
    a: parseInt(localStorage.getItem(`vote_a_${dailyItem.id}`) || '1243', 10), 
    b: parseInt(localStorage.getItem(`vote_b_${dailyItem.id}`) || '842', 10) 
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      const updated = storage.getDailyThisOrThat();
      setDailyItem(updated);
      setVotedOption(localStorage.getItem(`daily_vote_${updated.id}`));
      setVoteCounts({
        a: parseInt(localStorage.getItem(`vote_a_${updated.id}`) || '1243', 10),
        b: parseInt(localStorage.getItem(`vote_b_${updated.id}`) || '842', 10)
      });
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const handleVote = (option: 'a' | 'b') => {
    if (votedOption) return;
    setVotedOption(option);
    localStorage.setItem(`daily_vote_${dailyItem.id}`, option);
    
    setVoteCounts(prev => {
      const newCounts = {
        ...prev,
        [option]: prev[option] + 1
      };
      localStorage.setItem(`vote_${option}_${dailyItem.id}`, newCounts[option].toString());
      return newCounts;
    });
  };

  const getDropPreview = (drop: DropBoard) => {
    const p = drop.prompt.toLowerCase();
    if (p.includes('makan')) return <span className="tracking-[0.2em] text-[1.2em]">🍜🍔🍕🍣🥗</span>;
    if (p.includes('kopi')) return <div className="flex gap-3 font-bold text-gray-700 dark:text-gray-300 text-[0.8em]"><span>Rp18K</span><span>Rp22K</span><span>Rp25K</span><span>Rp15K</span></div>;
    if (p.includes('lagu') || drop.type === 'SONG') return <span className="tracking-[0.2em] text-[1.2em]">🎵🎧🎸🎹</span>;
    if (p.includes('desktop') || drop.type === 'PHOTO') return <span className="tracking-[0.2em] text-[1.2em]">📸🖼️💻📱</span>;
    if (drop.type === 'PLACE') return <span className="tracking-[0.2em] text-[1.2em]">📍🗺️🛵🏕️</span>;
    if (drop.type === 'NUMBER') return <div className="flex gap-3 font-bold text-gray-700 dark:text-gray-300 text-[0.8em]"><span>42</span><span>100</span><span>7</span><span>99</span></div>;
    return <span className="tracking-[0.2em] text-[1.2em]">✨👀💡📝</span>;
  };

  const getTotalTalks = (dropId: string) => {
    return storage.getResponses(dropId).reduce((acc, r) => acc + (r.talks?.length || 0), 0);
  };

  const getTrendingPreview = (drop: DropBoard) => {
    const responses = storage.getResponses(drop.id);
    const photoUrls = responses
      .filter(r => r.content && typeof r.content === 'string' && (r.content.startsWith('http') || r.content.startsWith('data:')))
      .map(r => r.content as string);

    return {
      photos: photoUrls.slice(0, 5),
      extraCount: photoUrls.length > 5 ? photoUrls.length - 5 : 0,
      responses,
      totalCount: responses.length
    };
  };

  const [drops, setDrops] = useState<DropBoard[]>([]);
  const [savedDropIds, setSavedDropIds] = useState<string[]>(storage.getSavedDrops());
  const [activeMenuDropId, setActiveMenuDropId] = useState<string | null>(null);
  const [dropToDelete, setDropToDelete] = useState<string | null>(null);

  const handleToggleSave = (dropId: string) => {
    storage.toggleSaveDrop(dropId);
    setSavedDropIds(storage.getSavedDrops());
  };

  const handleDeleteDrop = () => {
    if (dropToDelete) {
      storage.deleteDrop(dropToDelete);
      setDrops(storage.getDrops());
      setDropToDelete(null);
      setActiveMenuDropId(null);
    }
  };

  const [quickPrompt, setQuickPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<ResponseType>('PHOTO');
  const [expiresIn, setExpiresIn] = useState('3 days');
  const [droppingCount, setDroppingCount] = useState(125);
  const [quickSettings, setQuickSettings] = useState({
    allowAnonymous: true,
    allowTalks: true
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTab, setTrendingTab] = useState<'trending' | 'newest'>('newest');
  const [quickImage, setQuickImage] = useState<string | null>(null);
  const [quickOptionCount, setQuickOptionCount] = useState<number>(2);
  const [quickOptions, setQuickOptions] = useState<string[]>(['', '', '', '', '', '']);

  const handleQuickOptionCountChange = (count: number) => {
    setQuickOptionCount(count);
    setQuickOptions(prev => {
      const next = [...prev];
      while (next.length < 6) next.push('');
      return next;
    });
  };

  useEffect(() => {
    const handleQuickImage = (e: any) => setQuickImage(e.detail);
    window.addEventListener('quick-drop-image', handleQuickImage);
    return () => window.removeEventListener('quick-drop-image', handleQuickImage);
  }, []);

  useEffect(() => {
    setDrops(storage.getDrops());
    
    // Update active dropping count based on real activity + baseline
    const updateCount = () => {
      const allResponses = storage.getResponses();
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      
      const recentResponses = allResponses.filter(r => 
        new Date(r.createdAt).getTime() > fiveMinutesAgo
      );
      
      const uniqueUsers = new Set(recentResponses.map(r => r.userId)).size;
      
      // Use 124 as baseline + random fluctuation + real recent unique droppers
      const baseline = 124;
      const fluctuation = Math.floor(Math.random() * 8);
      setDroppingCount(baseline + fluctuation + uniqueUsers);
    };

    updateCount();
    const interval = setInterval(updateCount, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, []);

  const handleQuickCreate = () => {
    if (!quickPrompt) return;
    
    if (!storage.getIsLoggedIn()) {
      window.dispatchEvent(new Event('open-login-modal'));
      return;
    }

    const isLoggedIn = storage.getIsLoggedIn();
    const expirationMs = expiresIn === '1 hour' ? (60 * 60 * 1000) : 
                        expiresIn === '1 day' ? (24 * 60 * 60 * 1000) : 
                        (3 * 24 * 60 * 60 * 1000);

    const newDrop: DropBoard = {
      id: Math.random().toString(36).substr(2, 9),
      slug: quickPrompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `drop-${Math.random().toString(36).substr(2, 9)}`,
      prompt: quickPrompt,
      type: selectedType,
      ownerId: isLoggedIn ? 'user_minekaze' : 'guest_user',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expirationMs).toISOString(),
      status: 'ACTIVE',
      coverImage: quickImage || undefined,
      isGuest: !isLoggedIn,
      settings: { 
        allowAnonymous: quickSettings.allowAnonymous, 
        allowReactions: true, 
        showPublicly: true,
        allowTalks: quickSettings.allowTalks,
        options: selectedType === 'CHOICE' ? quickOptions.slice(0, quickOptionCount).map((o, idx) => o.trim() || `Pilihan ${idx + 1}`) : undefined
      },
      stats: { views: 0, saves: 0 }
    };

    storage.saveDrop(newDrop);
    navigate(`/drop/${newDrop.slug}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const trendingList = storage.getTrendingDrops();
  const newList = storage.getNewDrops();
  const displayDrops = trendingTab === 'trending' ? trendingList : newList;
  const recentDrops = drops.filter(d => d.ownerId === 'user_minekaze').slice(0, 3);
  
  const recentActivityTypes = Array.from(new Set(
    [...drops]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(d => d.type)
  )).slice(0, 3);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PHOTO': return '📸';
      case 'TEXT': return '✍️';
      case 'NUMBER': return '🔢';
      case 'PLACE': return '📍';
      case 'SONG': return '🎵';
      case 'CHOICE': return '🗳️';
      default: return '...';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start">      <div className="flex-1 min-w-0 space-y-7 w-full">
      <div className="space-y-2">
        {/* Header */}
        <header className="flex justify-between items-center h-12">
          {!isSearchOpen ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
              <div className="block md:hidden">
                <Link to="/">
                  <img src="https://imgur.com/nuEi5Xj.jpg" alt="Kepoin" className="w-36 h-auto object-contain -ml-1" />
                </Link>
              </div>
              <div className="hidden md:block">
                {storage.getIsLoggedIn() && (
                  <h1 className="text-[12px] md:text-[14px] text-gray-500 dark:text-dark-muted uppercase tracking-wider font-bold leading-relaxed whitespace-nowrap">
                    {t.home.bannerTitle}
                  </h1>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.form 
              initial={{ opacity: 0, width: 0 }} 
              animate={{ opacity: 1, width: '100%' }} 
              className="flex-1 mr-3"
              onSubmit={handleSearch}
            >
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search kepoan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-dark-surface border-none rounded-full text-sm focus:ring-2 focus:ring-primary dark:text-dark-text outline-none"
                  onBlur={() => {
                    if (!searchQuery) setIsSearchOpen(false);
                  }}
                />
              </div>
            </motion.form>
          )}
          <div className="flex items-center gap-1">
            {!isSearchOpen && (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-400 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors cursor-pointer"
              >
                <Search size={20} />
              </button>
            )}
            {storage.getIsLoggedIn() && (
              <NotificationBell />
            )}
          </div>
        </header>

        {/* Announcement Banner */}
        <AnnouncementBanner />

        {/* Hero title & badges for guest, small description for logged in */}
        {storage.getIsLoggedIn() ? (
          <div className="mb-4 text-[13px] text-gray-500 dark:text-dark-muted font-medium">
            {t.home.loggedInDesc}
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-gray-900 dark:text-dark-text leading-tight">
              {t.home.heroTitle1} <br className="sm:hidden" /> <span className="text-[#12A889]">{t.home.heroTitle2}</span>
            </h1>
          </div>
        )}

        {/* Quick Create Card */}
        {storage.getIsLoggedIn() && (
          <section className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5 shadow-sm">
          <h2 className="text-[16px] font-bold flex items-center gap-2 mb-4 dark:text-dark-text">
            {t.home.quickCreateTitle}
          </h2>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <textarea 
                placeholder={t.home.quickCreatePlaceholder}
                className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-lg pl-4 pr-12 py-3 text-[15px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] focus:ring-4 focus:ring-orange-50 dark:focus:ring-[#12A889]/10 dark:text-dark-text transition-all resize-none min-h-[80px]"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuickCreate();
                  }
                }}
              />
              {/* Gallery upload inside placeholder on the right side */}
              <div className="absolute right-3 top-3">
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        window.dispatchEvent(new CustomEvent('quick-drop-image', { detail: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button type="button" className="p-1.5 text-gray-400 hover:text-[#12A889] transition-colors bg-white dark:bg-dark-surface rounded-md shadow-xs border border-gray-200 dark:border-dark-border">
                  <Image size={18} />
                </button>
              </div>
            </div>
            
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {[
                { type: 'PHOTO', icon: '📸', label: t.create.types.PHOTO },
                { type: 'TEXT', icon: '✍️', label: t.create.types.TEXT },
                { type: 'NUMBER', icon: '🔢', label: t.create.types.NUMBER },
                { type: 'PLACE', icon: '📍', label: t.create.types.PLACE },
                { type: 'SONG', icon: '🎵', label: t.create.types.SONG || 'Music' },
                { type: 'CHOICE', icon: '🗳️', label: t.create.types.CHOICE || 'Choice' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setSelectedType(item.type as ResponseType)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border transition-all whitespace-nowrap shrink-0
                    ${selectedType === item.type 
                      ? 'bg-orange-50 dark:bg-[#12A889]/10 border-orange-200 dark:border-[#12A889] text-[#12A889] dark:text-[#12A889] font-medium shadow-sm' 
                      : 'bg-white dark:bg-dark-surface border-gray-100 dark:border-dark-border text-gray-600 dark:text-dark-muted hover:border-gray-200 dark:hover:border-dark-muted'}
                  `}
                >
                  <span className="text-[14px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              
              <div className="w-px h-6 bg-gray-200 dark:bg-dark-border mx-1 shrink-0 hidden sm:block"></div>
              
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[13px] font-medium text-gray-500 dark:text-dark-muted whitespace-nowrap">{t.home.expirations} :</span>
                <select 
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="bg-transparent border-none text-[13px] font-medium text-gray-700 dark:text-dark-text outline-none cursor-pointer hover:text-charcoal dark:hover:text-dark-text transition-colors"
                >
                  <option value="1 hour" className="dark:bg-dark-surface">{t.create.exp.h1}</option>
                  <option value="1 day" className="dark:bg-dark-surface">{t.create.exp.d1}</option>
                  <option value="3 days" className="dark:bg-dark-surface">{t.create.exp.d3}</option>
                </select>
              </div>
              
              <div className="flex-1"></div>

              <button 
                onClick={handleQuickCreate}
                className="bg-charcoal dark:bg-[#12A889] text-white px-6 py-2 rounded-full text-[13px] font-bold hover:bg-black dark:hover:bg-orange-700 transition-colors whitespace-nowrap shadow-sm flex items-center gap-2"
              >
                {t.home.createBtn}
              </button>

            </div>

            {/* CHOICE options configuration if CHOICE is selected */}
            {selectedType === 'CHOICE' && (
              <div className="bg-gray-50 dark:bg-dark-bg/60 border border-gray-200 dark:border-dark-border p-4 rounded-xl space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold dark:text-dark-text">
                    {lang === 'id' ? 'Mau berapa pilihan opsi?' : 'How many poll choices?'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleQuickOptionCountChange(num)}
                        className={`w-7 h-7 rounded-lg text-[12px] font-bold transition-all ${
                          quickOptionCount === num
                            ? 'bg-[#12A889] text-white shadow-xs scale-105'
                            : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-dark-muted border border-gray-200 dark:border-dark-border hover:border-orange-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {quickOptions.slice(0, quickOptionCount).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-orange-100 dark:bg-[#12A889]/20 text-[#12A889] dark:text-orange-400 text-[11px] font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={lang === 'id' ? `Pilihan ke-${i + 1}...` : `Option ${i + 1}...`}
                        className="flex-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#12A889] dark:focus:border-[#12A889] dark:text-dark-text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...quickOptions];
                          next[i] = e.target.value;
                          setQuickOptions(next);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {/* Quick Settings (Checkboxes) */}
            <div className="flex items-center gap-6 px-1 pt-3 pb-2 ">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={quickSettings.allowAnonymous}
                    onChange={(e) => setQuickSettings({...quickSettings, allowAnonymous: e.target.checked})}
                    className="w-4 h-4 accent-[#12A889] rounded cursor-pointer"
                  />
                  <span className="text-[12px] font-bold text-gray-500 group-hover:text-gray-700 dark:text-dark-muted dark:group-hover:text-dark-text transition-colors uppercase tracking-wider">{t.create.allowAnon}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={quickSettings.allowTalks}
                    onChange={(e) => setQuickSettings({...quickSettings, allowTalks: e.target.checked})}
                    className="w-4 h-4 accent-[#12A889] rounded cursor-pointer"
                  />
                  <span className="text-[12px] font-bold text-gray-500 group-hover:text-gray-700 dark:text-dark-muted dark:group-hover:text-dark-text transition-colors uppercase tracking-wider">{t.create.allowTalks}</span>
                </label>
            </div>
            
            {/* Small description for response category & curiosity duration */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1 pb-0.5 text-[11.5px] text-gray-500 dark:text-dark-muted border-t border-gray-100/70 dark:border-dark-border/50">
              <div className="flex items-center gap-1.5">
                <span className="text-[#12A889] text-xs">💡</span>
                <span>
                  {lang === 'id' 
                    ? 'Pilih kategori jawaban & batas waktu masa berlaku ke-kepoan Anda.' 
                    : 'Choose the response category & expiration time for your curiosity.'}
                </span>
              </div>
              <div className="text-[11px] font-medium text-[#12A889]/90 dark:text-orange-400">
                {selectedType === 'PHOTO' && (lang === 'id' ? '📸 Format foto dari galeri/kamera' : '📸 Photos from gallery or camera')}
                {selectedType === 'TEXT' && (lang === 'id' ? '✍️ Format cerita/opini tertulis' : '✍️ Written story or opinions')}
                {selectedType === 'NUMBER' && (lang === 'id' ? '🔢 Format angka, nominal harga, atau skor' : '🔢 Price amounts, numbers, or scores')}
                {selectedType === 'PLACE' && (lang === 'id' ? '📍 Rekomendasi tempat/lokasi' : '📍 Places or location recommendations')}
                {selectedType === 'SONG' && (lang === 'id' ? '🎵 Rekomendasi judul lagu/musik' : '🎵 Song or music recommendations')}
                {selectedType === 'CHOICE' && (lang === 'id' ? '🗳️ Polling pilihan ganda' : '🗳️ Multiple-choice voting poll')}
              </div>
            </div>

          </div>
          </section>
        )}
      </div>

      {/* Activity Bar */}
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl sm:rounded-full px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#12A889] animate-pulse" />
          <span className="text-[13px] font-medium text-gray-800 dark:text-dark-text flex items-center gap-1.5">
            {droppingCount} {t.home.peopleDropping}
          </span>
        </div>
        <div className="text-[12px] font-medium text-gray-600 dark:text-dark-muted flex flex-wrap items-center gap-2 overflow-x-auto hide-scrollbar sm:justify-end">
          {recentActivityTypes.length > 0 ? (
            <>
              {recentActivityTypes.map((type) => (
                <span key={type} className="flex items-center gap-1.5 bg-gray-50 dark:bg-dark-bg px-3 py-1.5 rounded-full border border-gray-100 dark:border-dark-border">
                  <span>{getTypeIcon(type)}</span>
                  <span className="capitalize">{t.create.types[type as keyof typeof t.create.types] || type}</span>
                </span>
              ))}
              <Link to="/discover" className="flex items-center gap-1.5 bg-orange-50 dark:bg-[#12A889]/10 text-[#12A889] dark:text-orange-400 px-3 py-1.5 rounded-full border border-orange-200 dark:border-[#12A889]/20 hover:underline">
                <span>{t.home.more}</span>
              </Link>
            </>
          ) : (
            <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-dark-bg px-3 py-1.5 rounded-full border border-gray-100 dark:border-dark-border">
              <span>{t.home.waitingDrops}</span>
            </span>
          )}
        </div>
      </div>

      {/* Feed Tabs: TRENDING & NEW */}
      {drops.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTrendingTab('newest')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                  trendingTab === 'newest'
                    ? 'bg-[#12A889] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text'
                }`}
              >
                <span>{lang === 'id' ? 'BARU' : 'NEW'}</span>
              </button>
              {storage.getIsLoggedIn() && (
                <button
                  onClick={() => setTrendingTab('trending')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                    trendingTab === 'trending'
                      ? 'bg-[#12A889] text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text'
                  }`}
                >
                  <span>{lang === 'id' ? 'TRENDING' : 'TRENDING'}</span>
                </button>
              )}
            </div>
            <Link to="/discover" className="text-[13px] font-semibold text-[#12A889] hover:underline">
              {t.home.seeAll} →
            </Link>
          </div>
          
          
          <div className="flex flex-col gap-4">
            {(trendingTab === 'trending' ? trendingList : newList).slice(0, 10).map((drop, idx) => {
              const user = storage.getUserById(drop.ownerId);
              const responses = storage.getResponses(drop.id);
              const talks = getTotalTalks(drop.id);
              const { photos, extraCount } = getTrendingPreview(drop);
              
              const isTrending = trendingTab === 'trending';
              const rank = idx + 1;
              const dropDate = new Date(drop.createdAt);
              const now = new Date();
              const diffHours = Math.round((now.getTime() - dropDate.getTime()) / (1000 * 60 * 60));
              const timeString = diffHours < 1 ? 'baru saja' : `${diffHours} jam yang lalu`;
              
              // time left
              const expiry = new Date(drop.expiresAt);
              const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const timeLeftString = daysLeft > 0 ? `${daysLeft} Hari tersisa` : 'Berakhir';

              return (
                <div key={drop.id} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-md transition-shadow relative group overflow-hidden">
                  {/* Left: Vote / Rank block */}
                  <div className="flex flex-row sm:flex-col items-center justify-center gap-1 sm:gap-0 min-w-[40px] shrink-0 text-gray-400">
                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 hover:text-[#12A889] cursor-pointer text-[#12A889]" />
                    <span className="font-extrabold text-[13px] sm:text-[15px] text-gray-900 dark:text-white">
                      {responses.length >= 1000 ? (responses.length/1000).toFixed(1) + 'K' : responses.length}
                    </span>
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 hover:text-[#12A889] cursor-pointer" />
                  </div>

                  {/* Middle: Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/drop/${drop.slug}`} className="block">
                      <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900 dark:text-white leading-snug mb-1 truncate">
                        {drop.prompt}
                      </h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] text-gray-500 dark:text-dark-muted font-medium mb-3 truncate">
                        <span className="hover:text-[#12A889] cursor-pointer transition-colors shrink-0">
                           @{user?.username?.replace('@','') || 'someone'}
                        </span>
                        <span>•</span>
                        <span className="shrink-0">{timeString}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-text border border-gray-200 dark:border-dark-border">
                          {drop.type === 'PHOTO' ? '📸 Foto' : 
                           drop.type === 'TEXT' ? '📝 Teks' : 
                           drop.type === 'NUMBER' ? '🔢 Angka' : 
                           drop.type === 'CHOICE' ? '🗳️ Pilihan' : 
                           drop.type === 'SONG' ? '🎵 Lagu' : 
                           drop.type === 'PLACE' ? '📍 Lokasi' : drop.type}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#12A889]">
                          {timeLeftString}
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Right: Previews & Stats */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                    
                    {/* Previews */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {drop.type === 'PHOTO' && photos.length > 0 ? (
                        <>
                          {photos.slice(0, 3).map((url, i) => (
                            <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-200 overflow-hidden shadow-xs border border-white/50 shrink-0">
                              <img src={url} className="w-full h-full object-cover" onError={(e) => { (e.target).src = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=100&h=100&fit=crop'; }} />
                            </div>
                          ))}
                          {extraCount > 0 && (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center font-bold text-[11px] text-gray-600 border border-gray-200 shrink-0">
                              +{extraCount}
                            </div>
                          )}
                        </>
                      ) : drop.type === 'CHOICE' ? (
                        <div className="flex gap-1.5">
                           {drop.settings?.options?.slice(0, 3).map((v, i) => {
                             const count = responses.filter(r => r.content === v).length;
                             return (
                             <div key={i} className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex flex-col items-center justify-center font-bold text-[10px] sm:text-[11px] text-gray-700 dark:text-dark-text shrink-0 text-center px-1 overflow-hidden">
                                <span className="truncate w-full">{v}</span>
                                <span className="text-[9px] text-gray-400 font-medium">{count >= 1000 ? (count/1000).toFixed(1) + 'K' : count}</span>
                             </div>
                             );
                           })}
                           {responses.length > 0 && (
                           <div className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                              +{responses.length}
                           </div>
                           )}
                        </div>
                      ) : drop.type === 'SONG' ? (
                         <div className="flex gap-1.5">
                           {responses.slice(0, 3).map((r, i) => (
                             <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-200 overflow-hidden shadow-xs shrink-0 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-[20px]">
                               🎵
                             </div>
                           ))}
                           {responses.length > 3 && (
                           <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center font-bold text-[11px] text-gray-500 border border-gray-200 shrink-0">
                              +{responses.length - 3}
                           </div>
                           )}
                         </div>
                      ) : drop.type === 'NUMBER' ? (
                         <div className="flex gap-1.5">
                           {responses.slice(0, 3).map((r, i) => {
                             let val = String(r.content);
                             if (Number(r.content) >= 1000) val = (Number(r.content)/1000).toFixed(0) + 'K';
                             return (
                             <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex flex-col items-center justify-center font-bold text-[12px] sm:text-[13px] text-gray-700 dark:text-dark-text shrink-0 text-center px-1 overflow-hidden">
                                {val}
                             </div>
                             );
                           })}
                           {responses.length > 3 && (
                           <div className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                              +{responses.length - 3}
                           </div>
                           )}
                         </div>
                      ) : (
                        <div className="flex gap-1.5">
                           {responses.slice(0, 2).map((r, i) => (
                             <div key={i} className="w-14 h-12 sm:w-16 sm:h-14 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex flex-col p-1.5 shrink-0 overflow-hidden text-[9px] sm:text-[10px] text-gray-500 dark:text-dark-muted font-medium line-clamp-3 leading-tight break-words text-left">
                                {r.content?.toString()}
                             </div>
                           ))}
                           {responses.length > 2 && (
                           <div className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                              +{responses.length - 2}
                           </div>
                           )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center sm:items-end justify-center min-w-[80px] shrink-0 gap-1.5 border-l border-gray-100 dark:border-dark-border pl-3 sm:pl-4">
                      <div className="flex flex-row items-center justify-end gap-1.5">
                        <span className="font-extrabold text-[13px] sm:text-[14px] text-gray-900 dark:text-white">
                          {responses.length >= 1000 ? (responses.length/1000).toFixed(1) + 'K' : responses.length}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">JAWABAN</span>
                      </div>
                      <div className="flex flex-row items-center justify-end gap-1.5">
                        <span className="font-extrabold text-[11px] sm:text-[12px] text-gray-700 dark:text-gray-300">
                          {talks}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">OBROLAN</span>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <button className="text-gray-300 hover:text-gray-600 p-1">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {/* Small Discover CTA */}
      <Link 
        to="/discover"
        className="block bg-charcoal dark:bg-dark-surface dark:border dark:border-dark-border text-white rounded-xl p-5 sm:p-6 relative overflow-hidden group"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[14px] sm:text-[15px] font-medium text-gray-200 dark:text-dark-text truncate whitespace-nowrap">
              {lang === 'id' ? 'Penasaran? Gabung sekarang.' : 'Curious? Join now.'}
            </p>
          </div>
          <div className="bg-white/10 dark:bg-[#12A889] group-hover:bg-white/20 dark:group-hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg text-[14px] font-bold transition-all self-start sm:self-center shrink-0">
            {t.home.exploreBtn}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#12A889]/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      </Link>

      
      </div>
      
      
      {/* Right Sidebar */}
      <div className="hidden lg:flex w-[280px] shrink-0 flex-col gap-6 sticky top-4">
        
        {storage.getIsLoggedIn() && (
          <>
            {/* Widget 1: This or That */}
            <div className="bg-[#12A889] rounded-xl p-5 shadow-lg relative overflow-hidden text-white animate-pulse-slow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none animate-spin-slow" />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <span className="text-[14px]">💡</span>
                <h3 className="text-[11px] font-black uppercase tracking-wider text-white/90">
                  THIS OR THAT
                </h3>
              </div>
              <p className="text-[15px] font-bold text-white mb-5 leading-snug relative z-10">
                {dailyItem.prompt}
              </p>
              
              <div className="space-y-2 mb-4 relative z-10">
                {!votedOption ? (
                  <>
                    <button 
                      onClick={() => handleVote('a')}
                      className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl py-2.5 px-4 text-[13px] font-bold transition-colors text-left flex justify-between items-center"
                    >
                      <span>{dailyItem.optionA}</span>
                    </button>
                    <button 
                      onClick={() => handleVote('b')}
                      className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl py-2.5 px-4 text-[13px] font-bold transition-colors text-left flex justify-between items-center"
                    >
                      <span>{dailyItem.optionB}</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full bg-white/10 border border-white/20 rounded-xl p-3 relative overflow-hidden">
                       <div 
                         className="absolute top-0 left-0 bottom-0 bg-white/20" 
                         style={{ width: `${Math.round((voteCounts.a / (voteCounts.a + voteCounts.b)) * 100)}%` }}
                       />
                       <div className="relative z-10 flex justify-between items-center text-[13px] font-bold">
                         <span>{dailyItem.optionA} {votedOption === 'a' && '✓'}</span>
                         <span>{Math.round((voteCounts.a / (voteCounts.a + voteCounts.b)) * 100)}%</span>
                       </div>
                    </div>
                    <div className="w-full bg-white/10 border border-white/20 rounded-xl p-3 relative overflow-hidden">
                       <div 
                         className="absolute top-0 left-0 bottom-0 bg-white/20" 
                         style={{ width: `${Math.round((voteCounts.b / (voteCounts.a + voteCounts.b)) * 100)}%` }}
                       />
                       <div className="relative z-10 flex justify-between items-center text-[13px] font-bold">
                         <span>{dailyItem.optionB} {votedOption === 'b' && '✓'}</span>
                         <span>{Math.round((voteCounts.b / (voteCounts.a + voteCounts.b)) * 100)}%</span>
                       </div>
                    </div>
                  </div>
                )}
              </div>
    
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[12px] text-white/80 font-medium">
                  {(voteCounts.a + voteCounts.b).toLocaleString('id-ID')} jawaban
                </span>
              </div>
            </div>
    
            {/* Widget 2: Lagi Ramai */}
            <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                  LAGI RAMAI 🔥
                </h3>
              </div>
              <div className="flex flex-col gap-4">
                {trendingList.slice(0, 3).map((drop, idx) => {
                  const responses = storage.getResponses(drop.id);
                  const { photos } = getTrendingPreview(drop);
                  return (
                    <Link key={drop.id} to={`/drop/${drop.slug}`} className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-11 h-11 rounded-lg bg-gray-50 dark:bg-dark-bg overflow-hidden shrink-0 border border-gray-100 dark:border-dark-border flex items-center justify-center">
                         {drop.type === 'PHOTO' && photos.length > 0 ? (
                           <img src={photos[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                         ) : (
                           <span className="text-[18px]">
                             {drop.type === 'PHOTO' ? '📸' : 
                              drop.type === 'TEXT' ? '📝' : 
                              drop.type === 'NUMBER' ? '🔢' : 
                              drop.type === 'CHOICE' ? '🗳️' : 
                              drop.type === 'SONG' ? '🎵' : 
                              drop.type === 'PLACE' ? '📍' : drop.type}
                           </span>
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 dark:text-dark-text leading-tight mb-1 truncate group-hover:text-[#12A889] transition-colors">
                          {drop.prompt}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-dark-muted font-medium">
                          <span className="text-gray-900 dark:text-dark-text font-bold">
                            {responses.length >= 1000 ? (responses.length/1000).toFixed(1) + 'K' : responses.length}
                          </span> jawaban
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Widget 3: Orang Lagi Kepo */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              👀 ORANG LAGI KEPO
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600 dark:text-dark-muted">
                <span className="text-[16px]">📸</span>
                <span><strong className="text-gray-900 dark:text-dark-text group-hover:text-[#12A889] transition-colors">38</strong> sedang lihat Foto</span>
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600 dark:text-dark-muted">
                <span className="text-[16px]">🎵</span>
                <span><strong className="text-gray-900 dark:text-dark-text group-hover:text-[#12A889] transition-colors">27</strong> sedang cari Lagu</span>
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600 dark:text-dark-muted">
                <span className="text-[16px]">🔢</span>
                <span><strong className="text-gray-900 dark:text-dark-text group-hover:text-[#12A889] transition-colors">19</strong> sedang jawab Angka</span>
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600 dark:text-dark-muted">
                <span className="text-[16px]">💬</span>
                <span><strong className="text-gray-900 dark:text-dark-text group-hover:text-[#12A889] transition-colors">42</strong> sedang ngobrol</span>
              </div>
            </div>
          </div>
        </div>


      </div>
      
      {/* Delete Confirmation Modal */}

      {dropToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-dark-surface rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-dark-border text-center"
          >
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">
              {lang === 'id' ? 'Hapus Kiriman?' : 'Delete Share?'}
            </h3>
            <p className="text-gray-500 dark:text-dark-muted mb-8 leading-relaxed">
              {lang === 'id' ? 'Tindakan ini tidak bisa dibatalkan. Semua data terkait kiriman ini akan hilang.' : 'This action cannot be undone. All data related to this share will be lost.'}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteDrop}
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20"
              >
                {lang === 'id' ? 'Ya, Hapus' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDropToDelete(null)}
                className="w-full py-3.5 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-border text-gray-600 dark:text-dark-text font-bold rounded-2xl transition-all"
              >
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
