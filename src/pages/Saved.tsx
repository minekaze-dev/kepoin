/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { DropBoard } from '../types';
import { Link } from 'react-router-dom';
import { Bookmark, PlusCircle } from 'lucide-react';

import { useLanguage } from '../lib/i18n';

import { Header } from '../components/Header';

export const Saved = () => {
  const { t, lang } = useLanguage();
  const [savedDrops, setSavedDrops] = useState<DropBoard[]>([]);

  useEffect(() => {
    const savedIds = storage.getSavedDrops();
    const allDrops = storage.getDrops();
    setSavedDrops(allDrops.filter(d => savedIds.includes(d.id)));
  }, []);

  const getTotalTalks = (dropId: string) => {
    return storage.getResponses(dropId).reduce((acc, r) => acc + (r.talks?.length || 0), 0);
  };

  return (
    <div className="space-y-6">
      <Header title={t.saved.header} subtitle={t.saved.subtitle} showSearch={false} />

      {savedDrops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedDrops.map(drop => (
            <Link 
              key={drop.id}
              to={`/drop/${drop.slug}`}
              className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 rounded-xl hover:border-orange-200 dark:hover:border-[#12A889] hover:shadow-md transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="bg-orange-50 dark:bg-[#12A889]/10 text-[#12A889] dark:text-[#12A889] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  {t.create.types[drop.type.toUpperCase() as keyof typeof t.create.types] || drop.type}
                </span>
                <Bookmark size={14} className="text-[#12A889]" fill="currentColor" />
              </div>
              <h3 className="font-bold text-[16px] mb-2 group-hover:text-[#12A889] dark:group-hover:text-[#12A889] transition-colors leading-snug flex-1 dark:text-dark-text">
                {drop.prompt}
              </h3>
              <p className="text-[12px] text-gray-400 dark:text-dark-muted flex gap-1.5 items-center">
                <span>{storage.getResponses(drop.id).length} {lang === 'en' ? (storage.getResponses(drop.id).length === 1 ? 'answer' : 'answers') : 'jawaban'}</span>
                {getTotalTalks(drop.id) > 0 && (
                  <>
                    <span>•</span>
                    <span>{getTotalTalks(drop.id)} {lang === 'en' ? (getTotalTalks(drop.id) === 1 ? 'talk' : 'talks') : 'obrolan'}</span>
                  </>
                )}
                <span>•</span>
                <span>{t.public.createdBy} {drop.ownerId === 'user_minekaze' ? t.public.you : t.public.someone}</span>
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center gap-4 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border border-dashed rounded-2xl">
          <div className="w-16 h-16 bg-gray-50 dark:bg-dark-bg rounded-full flex items-center justify-center text-gray-300 dark:text-dark-muted">
            <Bookmark size={32} />
          </div>
          <div>
            <p className="text-gray-500 dark:text-dark-text font-bold">{t.saved.noDrops}</p>
            <p className="text-gray-400 dark:text-dark-muted text-[13px]">{t.saved.noDropsSub}</p>
          </div>
          <Link 
            to="/create"
            className="flex items-center gap-2 bg-gradient-to-r from-[#12A889] to-blue-600 hover:opacity-95 text-white px-6 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-md shadow-[#12A889]/20"
          >
            <PlusCircle size={18} />
            {t.saved.createBtn}
          </Link>
        </div>
      )}
    </div>
  );
};
