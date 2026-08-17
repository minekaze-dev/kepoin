/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { DropBoard } from '../types';
import { Link } from 'react-router-dom';
import { BarChart2, ExternalLink, Share2, MoreVertical } from 'lucide-react';

import { useLanguage } from '../lib/i18n';

export const MyResults = () => {
  const { t, lang } = useLanguage();
  const [drops, setDrops] = useState<DropBoard[]>([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    setDrops(storage.getDrops().filter(d => d.ownerId === 'user_minekaze'));
  }, []);

  const filtered = drops.filter(d => {
    if (activeTab === 'Active') return d.status === 'ACTIVE';
    if (activeTab === 'Closed') return d.status === 'CLOSED' || d.status === 'EXPIRED';
    return true;
  });

  const getTotalTalks = (dropId: string) => {
    return storage.getResponses(dropId).reduce((acc, r) => acc + (r.talks?.length || 0), 0);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-[28px] font-bold text-charcoal dark:text-dark-text tracking-tight">{t.myResults.header}</h1>
        <p className="text-[14px] text-gray-500 dark:text-dark-muted">{t.myResults.subtitle}</p>
      </header>

      <div className="flex gap-1 bg-white dark:bg-dark-surface p-1 rounded-xl border border-gray-100 dark:border-dark-border self-start w-fit">
        {['All', 'Active', 'Closed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-1.5 rounded-lg text-[13px] font-bold transition-all ${activeTab === tab ? 'bg-[#12A889] text-white shadow-md shadow-[#12A889]/20' : 'text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(drop => (
          <div key={drop.id} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-bold text-[16px] dark:text-dark-text">{drop.prompt}</h3>
              <div className="flex flex-wrap items-center gap-3 text-[12px]">
                <span className="text-gray-400 dark:text-dark-muted uppercase font-bold tracking-wider">{t.create.types[drop.type.toUpperCase() as keyof typeof t.create.types] || drop.type}</span>
                <span className="text-gray-500 dark:text-dark-muted flex gap-1.5 items-center">
                  <span>{storage.getResponses(drop.id).length} {lang === 'en' ? (storage.getResponses(drop.id).length === 1 ? 'answer' : 'answers') : 'jawaban'}</span>
                  {getTotalTalks(drop.id) > 0 && (
                    <>
                      <span>•</span>
                      <span>{getTotalTalks(drop.id)} {lang === 'en' ? (getTotalTalks(drop.id) === 1 ? 'talk' : 'talks') : 'obrolan'}</span>
                    </>
                  )}
                </span>
                <span className={`flex items-center gap-1 font-bold ${drop.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${drop.status === 'ACTIVE' ? 'bg-green-600' : 'bg-red-500'}`} />
                  {drop.status}
                </span>
                <span className="text-gray-400 dark:text-dark-muted">{t.myResults.created} {new Date(drop.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/drop/${drop.slug}`} className="bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-border p-2 rounded-lg text-gray-600 dark:text-dark-text transition-colors">
                <ExternalLink size={18} />
              </Link>
              <Link to={`/drop/${drop.slug}/results`} className="flex items-center gap-2 bg-charcoal dark:bg-[#12A889] text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-all">
                <BarChart2 size={16} />
                {t.public.results}
              </Link>
              <button className="p-2 text-gray-400 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 text-center bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border border-dashed rounded-2xl">
            <p className="text-gray-400 dark:text-dark-muted">{t.myResults.noDrops}</p>
          </div>
        )}
      </div>
    </div>
  );
};
