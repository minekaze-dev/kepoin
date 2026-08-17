/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { ResponseType, DropBoard } from '../types';
import { Check, Copy, ExternalLink, ArrowRight, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/i18n';

export const CreateDrop = () => {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state || {};

  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState(initialData.prompt || '');
  const [type, setType] = useState<ResponseType>(initialData.type || 'PHOTO');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [settings, setSettings] = useState({
    allowAnonymous: true,
    allowReactions: true,
    showPublicly: true,
    allowTalks: true,
    maxResponses: 0,
    expiration: initialData.expiration || '3 days'
  });
  const [optionCount, setOptionCount] = useState<number>(initialData.options?.length || 2);
  const [options, setOptions] = useState<string[]>(initialData.options || ['', '', '', '', '', '']); // For CHOICE type
  
  const handleOptionCountChange = (count: number) => {
    setOptionCount(count);
    setOptions(prev => {
      const next = [...prev];
      while (next.length < 6) next.push('');
      return next;
    });
  };
  
  const [createdDrop, setCreatedDrop] = useState<DropBoard | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    const isLoggedIn = storage.getIsLoggedIn();
    if (!isLoggedIn) {
      const existingGuestDrop = storage.getDrops().find(d => d.isGuest);
      if (existingGuestDrop) {
        alert('Guest accounts can only create 1 drop at a time, which automatically disappears after 1 hour. Please log in to create unlimited drops.');
        return;
      }
    }

    const slug = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `drop-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate expiration time based on settings
    let expirationMs = isLoggedIn ? (3 * 24 * 60 * 60 * 1000) : (60 * 60 * 1000); // 1 hour for guests
    if (isLoggedIn) {
      if (settings.expiration === '1 hour') expirationMs = 60 * 60 * 1000;
      else if (settings.expiration === '1 day') expirationMs = 24 * 60 * 60 * 1000;
    }
    
    const newDrop: DropBoard = {
      id: Math.random().toString(36).substr(2, 9),
      slug,
      prompt,
      description,
      coverImage,
      type,
      ownerId: isLoggedIn ? storage.getUser().id : 'guest_user',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expirationMs).toISOString(),
      status: 'ACTIVE',
      isGuest: !isLoggedIn,
      settings: {
        allowAnonymous: settings.allowAnonymous,
        allowReactions: settings.allowReactions,
        showPublicly: settings.showPublicly,
        allowTalks: settings.allowTalks,
        options: type === 'CHOICE' ? options.slice(0, optionCount).map((o, idx) => o.trim() || `Pilihan ${idx + 1}`) : undefined
      },
      stats: { views: 0, saves: 0 }
    };

    storage.saveDrop(newDrop);
    setCreatedDrop(newDrop);
    setStep(6); // Success step
  };

  const copyToClipboard = () => {
    if (!createdDrop) return;
    const url = `${window.location.origin}/drop/${createdDrop.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 6 && createdDrop) {
    return (
      <div className="max-w-md mx-auto py-10 text-center space-y-6">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto text-4xl">
          🎉
        </div>
        <div>
          <h1 className="text-2xl font-bold dark:text-dark-text">{t.create.success}</h1>
          <p className="text-gray-500 dark:text-dark-muted text-[14px]">{t.create.successSub}</p>
        </div>
        
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 rounded-xl flex items-center justify-between gap-3 shadow-sm">
          <code className="text-[13px] text-gray-600 dark:text-dark-text truncate">
            kukepo.app/drop/{createdDrop.slug}
          </code>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-charcoal dark:bg-[#12A889] text-white px-3 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-black dark:hover:bg-orange-700 transition-colors shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t.create.copied : t.create.copyBtn}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate(`/drop/${createdDrop.slug}`)}
            className="flex items-center justify-center gap-2 border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-bg py-3 rounded-xl text-[14px] font-bold dark:text-dark-text transition-all"
          >
            <ExternalLink size={16} />
            {t.create.openBtn}
          </button>
          <button 
            onClick={() => navigate(`/drop/${createdDrop.slug}/results`)}
            className="flex items-center justify-center gap-2 border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-bg py-3 rounded-xl text-[14px] font-bold dark:text-dark-text transition-all"
          >
            <ArrowRight size={16} />
            {t.create.viewResBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-10">
      <header>
        <h1 className="text-2xl md:text-[28px] font-bold text-charcoal dark:text-dark-text tracking-tight">{t.create.header}</h1>
        <p className="text-[14px] text-gray-500 dark:text-dark-muted">{t.create.subtitle}</p>
      </header>

      <div className="space-y-8">
        {/* Step 1: Prompt */}
        <div className="space-y-3">
          <label className="text-[14px] font-bold uppercase tracking-wider text-gray-400">{t.create.step1}</label>
          <h3 className="text-[16px] font-bold dark:text-dark-text">{t.create.promptLabel}</h3>
          <input 
            type="text" 
            placeholder={t.home.quickCreatePlaceholder}
            className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3.5 text-[15px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text transition-all shadow-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* Step 2: Response Type */}
        <div className="space-y-4">
          <label className="text-[14px] font-bold uppercase tracking-wider text-gray-400">{t.create.step2}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { type: 'PHOTO', icon: '📸', label: t.create.types.PHOTO },
              { type: 'TEXT', icon: '✍️', label: t.create.types.TEXT },
              { type: 'NUMBER', icon: '🔢', label: t.create.types.NUMBER },
              { type: 'PLACE', icon: '📍', label: t.create.types.PLACE },
              { type: 'SONG', icon: '🎵', label: t.create.types.SONG },
              { type: 'CHOICE', icon: '🗳️', label: t.create.types.CHOICE },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => setType(item.type as ResponseType)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2
                  ${type === item.type 
                    ? 'bg-orange-50 dark:bg-[#12A889]/10 border-orange-200 dark:border-[#12A889] text-[#12A889] dark:text-[#12A889] font-bold' 
                    : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted hover:border-gray-300 dark:hover:border-dark-muted'}
                `}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>

          <p className="text-[12px] text-gray-500 dark:text-dark-muted flex items-center gap-1.5 px-1">
            <span className="text-[#12A889]">💡</span>
            <span>
              {type === 'PHOTO' && (lang === 'id' ? 'Format foto: Minta orang lain mengirim gambar/foto dari perangkat mereka.' : 'Photo format: Ask people to share photos or images.')}
              {type === 'TEXT' && (lang === 'id' ? 'Format teks: Kumpulkan cerita, opini, atau jawaban tertulis bebas.' : 'Text format: Collect stories, opinions, or written text.')}
              {type === 'NUMBER' && (lang === 'id' ? 'Format angka: Minta estimasi harga, jumlah, atau angka tertentu.' : 'Number format: Ask for prices, counts, or numbers.')}
              {type === 'PLACE' && (lang === 'id' ? 'Format tempat: Rekomendasi nama lokasi, cafe, atau tempat wisata.' : 'Place format: Ask for location or place recommendations.')}
              {type === 'SONG' && (lang === 'id' ? 'Format lagu: Rekomendasi lagu favorit atau playlist musik.' : 'Song format: Ask for song and artist recommendations.')}
              {type === 'CHOICE' && (lang === 'id' ? 'Format pilihan: Buat polling dengan opsi pilihan ganda yang kamu tentukan.' : 'Choice format: Multiple choice voting with custom options.')}
            </span>
          </p>
          
          {type === 'CHOICE' && (
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-5 rounded-2xl space-y-4 animate-in fade-in duration-300 shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13.5px] font-bold dark:text-dark-text">
                    {lang === 'id' ? '1. Mau berapa pilihan opsi?' : '1. How many poll choices?'}
                  </label>
                  <span className="text-[12px] font-bold text-[#12A889] dark:text-orange-400 bg-orange-50 dark:bg-[#12A889]/10 px-2.5 py-0.5 rounded-full border border-orange-200/60 dark:border-[#12A889]/20">
                    {optionCount} {lang === 'id' ? 'Pilihan' : 'Choices'}
                  </span>
                </div>
                
                {/* Count selector buttons: 2, 3, 4, 5, 6 */}
                <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleOptionCountChange(num)}
                      className={`py-2 px-1 text-center rounded-xl text-[13px] font-bold border transition-all cursor-pointer ${
                        optionCount === num
                          ? 'bg-[#12A889] text-white border-[#12A889] shadow-sm shadow-[#12A889]/30 scale-[1.02]'
                          : 'bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-orange-300 dark:hover:border-[#12A889]/50'
                      }`}
                    >
                      {num} {lang === 'id' ? 'Opsi' : 'Opts'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic choice input columns */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-dark-border">
                <label className="text-[12px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                  {lang === 'id' ? '2. Tulis isi pilihan di bawah:' : '2. Enter option labels:'}
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {options.slice(0, optionCount).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-[#12A889]/20 text-[#12A889] dark:text-orange-400 text-[13px] font-black flex items-center justify-center shrink-0 border border-orange-200/50 dark:border-[#12A889]/20">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={lang === 'id' ? `Tulis pilihan ke-${i + 1}...` : `Option ${i + 1}...`}
                        className="flex-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#12A889] dark:focus:border-[#12A889] dark:text-dark-text transition-all"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[i] = e.target.value;
                          setOptions(newOpts);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Description */}
        <div className="space-y-3">
          <label className="text-[14px] font-bold uppercase tracking-wider text-gray-400">{t.create.step3}</label>
          <textarea 
            placeholder={t.create.descPlaceholder}
            className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text transition-all shadow-sm min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="pt-2">
            <label className="text-[14px] font-bold uppercase tracking-wider text-gray-400 block mb-2">{t.create.bgImage}</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder={t.create.bgImagePlaceholder}
                className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl pl-4 pr-12 py-3 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text transition-all shadow-sm"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCoverImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button type="button" className="text-gray-400 hover:text-[#12A889] transition-colors p-1">
                  <Image size={20} />
                </button>
              </div>
            </div>
            {coverImage && (
              <div className="mt-3 relative rounded-xl overflow-hidden h-32 border border-gray-200 dark:border-dark-border group">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${coverImage})` }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm tracking-widest drop-shadow-md">BACKGROUND PREVIEW</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[14px] font-bold uppercase tracking-wider text-gray-400">{t.create.step4}</label>
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium dark:text-dark-text">{t.create.allowAnon}</span>
                <input 
                  type="checkbox" 
                  className="accent-[#12A889] w-4 h-4"
                  checked={settings.allowAnonymous}
                  onChange={(e) => setSettings({...settings, allowAnonymous: e.target.checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium dark:text-dark-text">{t.create.allowReact}</span>
                <input 
                  type="checkbox" 
                  className="accent-[#12A889] w-4 h-4"
                  checked={settings.allowReactions}
                  onChange={(e) => setSettings({...settings, allowReactions: e.target.checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium dark:text-dark-text">{t.create.showPublic}</span>
                <input 
                  type="checkbox" 
                  className="accent-[#12A889] w-4 h-4"
                  checked={settings.showPublicly}
                  onChange={(e) => setSettings({...settings, showPublicly: e.target.checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium dark:text-dark-text">{t.create.allowTalks}</span>
                <input 
                  type="checkbox" 
                  className="accent-[#12A889] w-4 h-4"
                  checked={settings.allowTalks}
                  onChange={(e) => setSettings({...settings, allowTalks: e.target.checked})}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[14px] font-bold uppercase tracking-wider text-gray-400">{t.create.step5}</label>
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm flex items-center justify-between">
              <span className="text-[13px] font-medium dark:text-dark-text">
                {lang === 'id' ? 'Masa Berlaku Ke-kepoan :' : 'Curiosity Expiration :'}
              </span>
              <select 
                value={settings.expiration}
                onChange={(e) => setSettings({...settings, expiration: e.target.value})}
                className="bg-transparent border-none text-[13px] font-bold text-[#12A889] dark:text-[#12A889] outline-none cursor-pointer"
              >
                <option value="1 hour">{t.create.exp.h1}</option>
                <option value="1 day">{t.create.exp.d1}</option>
                <option value="3 days">{t.create.exp.d3}</option>
              </select>
            </div>
            <p className="text-[12px] text-gray-500 dark:text-dark-muted flex items-center gap-1.5 px-1">
              <span>⏳</span>
              <span>
                {lang === 'id' 
                  ? 'Pertanyaan akan otomatis ditutup saat masa berlaku habis dan hasil akhir siap dilihat.' 
                  : 'The question automatically closes when time expires and final results can be viewed.'}
              </span>
            </p>
          </div>
        </div>

        <button 
          onClick={handleCreate}
          disabled={!prompt}
          className={`
            w-full py-4 rounded-xl font-bold text-[16px] transition-all shadow-lg
            ${prompt 
              ? 'bg-[#12A889] text-white hover:bg-[#12A889] shadow-[#12A889]/20' 
              : 'bg-gray-100 dark:bg-dark-surface text-gray-400 dark:text-dark-muted cursor-not-allowed'}
          `}
        >
          {t.create.submitBtn}
        </button>
      </div>
    </div>
  );
};
