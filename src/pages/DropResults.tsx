/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { DropBoard, DropResponse } from '../types';
import { ArrowLeft, Users, Calendar, TrendingUp } from 'lucide-react';

import { useLanguage } from '../lib/i18n';

export const DropResults = () => {
  const { t, lang } = useLanguage();
  const { slug } = useParams();
  const [drop, setDrop] = useState<DropBoard | null>(null);
  const [responses, setResponses] = useState<DropResponse[]>([]);

  useEffect(() => {
    const allDrops = storage.getDrops();
    const foundDrop = allDrops.find(d => d.slug === slug);
    if (foundDrop) {
      setDrop(foundDrop);
      setResponses(storage.getResponses(foundDrop.id));
    }
  }, [slug]);

  if (!drop) return <div className="py-20 text-center dark:text-dark-muted">{t.results.notFound}</div>;

  const stats = [
    { label: t.results.stats.total, value: responses.length, icon: Users, color: 'bg-orange-50 dark:bg-[#12A889]/10 text-[#12A889] dark:text-[#12A889]' },
    { label: t.results.stats.today, value: responses.filter(r => new Date(r.createdAt).toDateString() === new Date().toDateString()).length, icon: TrendingUp, color: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500' },
    { label: t.results.stats.participants, value: new Set(responses.map(r => r.userName)).size, icon: Calendar, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500' },
  ];

  const renderVisuals = () => {
    switch (drop.type) {
      case 'CHOICE':
        const counts: Record<string, number> = {};
        drop.settings.options?.forEach(opt => counts[opt] = 0);
        responses.forEach(r => {
          if (counts[r.content] !== undefined) counts[r.content]++;
        });
        const total = responses.length || 1;

        return (
          <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-[16px] mb-4 dark:text-dark-text">{t.results.pollResults}</h3>
            {drop.settings.options?.map(opt => {
              const count = counts[opt] || 0;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={opt} className="space-y-1.5">
                  <div className="flex justify-between text-[13px] font-bold dark:text-dark-text">
                    <span>{opt}</span>
                    <span>{percentage}% ({count})</span>
                  </div>
                  <div className="w-full h-3 bg-gray-50 dark:bg-dark-bg rounded-full overflow-hidden border border-gray-100 dark:border-dark-border">
                    <div 
                      className="h-full bg-[#12A889] rounded-full transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      
      case 'NUMBER':
        const numbers = responses.map(r => Number(r.content)).filter(n => !isNaN(n));
        const avg = numbers.length ? Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length) : 0;
        const min = numbers.length ? Math.min(...numbers) : 0;
        const max = numbers.length ? Math.max(...numbers) : 0;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: t.results.average, value: avg.toLocaleString(), color: 'text-[#12A889] dark:text-[#12A889]' },
              { label: t.results.lowest, value: min.toLocaleString(), color: 'text-gray-600 dark:text-dark-muted' },
              { label: t.results.highest, value: max.toLocaleString(), color: 'text-gray-600 dark:text-dark-muted' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 rounded-2xl text-center shadow-sm">
                <p className="text-[12px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        );

      case 'SONG':
        const songCounts: Record<string, number> = {};
        responses.forEach(r => {
          const title = String(r.content || '');
          if (title) songCounts[title] = (songCounts[title] || 0) + 1;
        });
        const sortedSongs = Object.entries(songCounts).sort((a, b) => b[1] - a[1]);

        return (
          <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-[16px] mb-3 dark:text-dark-text flex items-center gap-2">
              <span>🎧</span> Top Rekomendasi Lagu
            </h3>
            <div className="space-y-2">
              {sortedSongs.map(([songTitle, count], idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/60 dark:border-purple-900/30">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[14px] text-gray-800 dark:text-dark-text">{songTitle}</span>
                  </div>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-dark-surface px-2.5 py-1 rounded-full shadow-xs">
                    {count} {lang === 'id' ? 'rekomendasi' : 'votes'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'PLACE':
        const placeCounts: Record<string, number> = {};
        responses.forEach(r => {
          const name = String(r.content || '');
          if (name) placeCounts[name] = (placeCounts[name] || 0) + 1;
        });
        const sortedPlaces = Object.entries(placeCounts).sort((a, b) => b[1] - a[1]);

        return (
          <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-[16px] mb-3 dark:text-dark-text flex items-center gap-2">
              <span>📍</span> Tempat yang Direkomendasikan
            </h3>
            <div className="space-y-2">
              {sortedPlaces.map(([placeName, count], idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[14px] text-gray-800 dark:text-dark-text">{placeName}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-dark-surface px-2.5 py-1 rounded-full shadow-xs">
                    {count} {lang === 'id' ? 'rekomendasi' : 'drops'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'PHOTO':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {responses.map(r => (
              <div key={r.id} className="aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                <img 
                  src={r.content} 
                  alt={r.caption || "response"} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&h=300&fit=crop';
                  }}
                />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6 text-center">
            <p className="text-gray-400 dark:text-dark-muted italic">{t.results.vizComingSoon.replace('{type}', t.create.types[drop.type.toUpperCase() as keyof typeof t.create.types] || drop.type)}</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to={`/drop/${drop.slug}`} className="flex items-center gap-2 text-gray-400 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text text-[13px] font-medium transition-colors">
        <ArrowLeft size={16} />
        {t.results.backToBoard}
      </Link>

      <header>
        <h1 className="text-2xl md:text-[28px] font-bold text-charcoal dark:text-dark-text tracking-tight">{t.results.header}</h1>
        <p className="text-[14px] text-gray-500 dark:text-dark-muted mt-1">{drop.prompt}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-wider">{s.label}</p>
              <p className="text-[18px] font-black text-charcoal dark:text-dark-text">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-[18px] font-bold dark:text-dark-text">{t.results.viz}</h2>
        {renderVisuals()}
      </div>

      <section className="space-y-4">
        <h2 className="text-[18px] font-bold dark:text-dark-text">{t.results.history}</h2>
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                <th className="px-6 py-4 text-[12px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-wider">{t.results.tableUser}</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-wider">{t.results.tableContent}</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-wider">{t.results.tableTime}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {responses.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-dark-bg overflow-hidden border border-gray-100 dark:border-dark-border">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.userName}`} alt="avatar" />
                      </div>
                      <span className="text-[13px] font-medium dark:text-dark-text">{r.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] text-gray-600 dark:text-dark-muted truncate max-w-[200px] block">
                      {typeof r.content === 'object' ? JSON.stringify(r.content) : r.content}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-gray-400 dark:text-dark-muted">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
