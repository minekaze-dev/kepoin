/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { storage } from './storage';
import { translations, Language } from './translations';

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

  return { lang: safeLang, t, setLang, toggleLang };
}
