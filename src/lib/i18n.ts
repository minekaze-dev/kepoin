/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { storage } from './storage';
import { translations, Language } from './translations';

export function formatRelativeTime(dateInput: string | Date, lang: Language = 'id'): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (lang === 'en') {
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    if (diffHour < 24) return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
    if (diffDay === 1) return '1 day ago';
    if (diffDay < 30) return `${diffDay} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (lang === 'slank') {
    if (diffSec < 60) return 'baru aja';
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay === 1) return 'kemarin';
    if (diffDay < 30) return `${diffDay} hari lalu`;
    return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  } else {
    if (diffSec < 60) return 'baru saja';
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    if (diffDay === 1) return 'kemarin';
    if (diffDay < 30) return `${diffDay} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  }
}

export function formatTimeLeft(expiresAtInput: string | Date, lang: Language = 'id'): string {
  const expiry = typeof expiresAtInput === 'string' ? new Date(expiresAtInput) : expiresAtInput;
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) {
    if (lang === 'en') return 'Expired';
    if (lang === 'slank') return 'Udah Habis';
    return 'Berakhir';
  }

  const hoursLeft = Math.ceil(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (lang === 'en') {
    if (daysLeft > 1) return `${daysLeft} days left`;
    if (daysLeft === 1) {
      if (hoursLeft > 1) return `${hoursLeft} hours left`;
      return '1 hour left';
    }
    return hoursLeft > 1 ? `${hoursLeft} hours left` : '1 hour left';
  } else if (lang === 'slank') {
    if (daysLeft > 1) return `${daysLeft} Hari sisa`;
    if (daysLeft === 1) {
      if (hoursLeft > 1) return `${hoursLeft} Jam sisa`;
      return '1 Jam sisa';
    }
    return `${hoursLeft} Jam sisa`;
  } else {
    if (daysLeft > 1) return `${daysLeft} Hari tersisa`;
    if (daysLeft === 1) {
      if (hoursLeft > 1) return `${hoursLeft} Jam tersisa`;
      return '1 Jam tersisa';
    }
    return `${hoursLeft} Jam tersisa`;
  }
}

export function getCategoryLabel(type: string, lang: Language = 'id'): string {
  switch (type) {
    case 'PHOTO':
      return `📸 ${lang === 'en' ? 'Photo' : 'Foto'}`;
    case 'TEXT':
      return `📝 ${lang === 'en' ? 'Text' : 'Teks'}`;
    case 'NUMBER':
      return `🔢 ${lang === 'en' ? 'Number' : 'Angka'}`;
    case 'CHOICE':
      return `🗳️ ${lang === 'en' ? 'Choice' : 'Pilihan'}`;
    case 'SONG':
      return `🎵 ${lang === 'en' ? 'Song' : 'Lagu'}`;
    case 'PLACE':
      return `📍 ${lang === 'en' ? 'Place' : 'Lokasi'}`;
    default:
      return type;
  }
}

export function getAnswerCountLabel(count: number, lang: Language = 'id', uppercase: boolean = false): string {
  if (uppercase) {
    if (lang === 'en') return count === 1 ? 'ANSWER' : 'ANSWERS';
    return 'JAWABAN';
  }
  if (lang === 'en') return count === 1 ? 'answer' : 'answers';
  return 'jawaban';
}

export function getTalkCountLabel(count: number, lang: Language = 'id', uppercase: boolean = false): string {
  if (uppercase) {
    if (lang === 'en') return count === 1 ? 'TALK' : 'TALKS';
    return 'OBROLAN';
  }
  if (lang === 'en') return count === 1 ? 'talk' : 'talks';
  return 'obrolan';
}

export function useLanguage() {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = storage.getLang();
    return (saved && translations[saved]) ? saved : 'id';
  });

  useEffect(() => {
    const handleStorage = () => {
      const current = storage.getLang();
      setLangState((current && translations[current]) ? current : 'id');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const safeLang = (lang && translations[lang]) ? lang : 'id';
  const t = translations[safeLang] || translations.id || translations.en;

  const setLang = (newLang: Language) => {
    const target = translations[newLang] ? newLang : 'id';
    storage.setLang(target);
    setLangState(target);
  };

  const toggleLang = (newLang?: Language) => {
    if (newLang && translations[newLang]) {
      setLang(newLang);
    } else {
      // Toggle between id and en
      const next = safeLang === 'id' ? 'en' : 'id';
      setLang(next);
    }
  };

  return { 
    lang: safeLang, 
    t, 
    setLang, 
    toggleLang,
    formatRelativeTime: (d: string | Date) => formatRelativeTime(d, safeLang),
    formatTimeLeft: (d: string | Date) => formatTimeLeft(d, safeLang),
    getCategoryLabel: (type: string) => getCategoryLabel(type, safeLang),
    getAnswerCountLabel: (count: number, uppercase?: boolean) => getAnswerCountLabel(count, safeLang, uppercase),
    getTalkCountLabel: (count: number, uppercase?: boolean) => getTalkCountLabel(count, safeLang, uppercase)
  };
}
