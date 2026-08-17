/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { storage } from './storage';
import { translations, Language } from './translations';

export function useLanguage() {
  const [lang, setLang] = useState<Language>(storage.getLang());

  useEffect(() => {
    const handleStorage = () => {
      setLang(storage.getLang());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = translations[lang];

  const toggleLang = (newLang: Language) => {
    storage.setLang(newLang);
    setLang(newLang);
  };

  return { lang, t, toggleLang };
}
