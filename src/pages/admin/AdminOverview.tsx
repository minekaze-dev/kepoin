/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  HelpCircle, 
  MessageSquare, 
  MessagesSquare, 
  ShieldAlert, 
  Clock, 
  Activity, 
  ArrowUpRight, 
  AlertTriangle,
  Flame,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { DropBoard, ReportItem, ActivityLog } from '../../types';

export const AdminOverview: React.FC = () => {
  const [drops, setDrops] = useState<DropBoard[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logFilter, setLogFilter] = useState<string>('ALL');

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  const loadData = () => {
    setDrops(storage.getDrops(true, true));
    setReports(storage.getReports());
    setLogs(storage.getActivityLogs());
  };

  const allUsers = storage.getAllUsers();
  const allResponses = storage.getResponses();
  const now = Date.now();

  // Active Asks
  const activeAsks = drops.filter(d => {
    if (d.status === 'EXPIRED' || d.isHidden) return false;
    if (d.expiresAt && new Date(d.expiresAt).getTime() < now) return false;
    return true;
  });

  // Answers today (last 24h)
  const answersToday = allResponses.filter(r => {
    const diff = now - new Date(r.createdAt).getTime();
    return diff <= 24 * 3600 * 1000;
  });

  // Talks today (last 24h)
  let talksTodayCount = 0;
  allResponses.forEach(r => {
    if (r.talks) {
      r.talks.forEach(t => {
        if (now - new Date(t.createdAt).getTime() <= 24 * 3600 * 1000) {
          talksTodayCount++;
        }
      });
    }
  });

  // Pending Reports
  const pendingReports = reports.filter(r => r.status === 'PENDING');

  // Content expiring soon (within next 24 hours or less)
  const expiringSoon = drops.filter(d => {
    if (d.status === 'EXPIRED' || d.isHidden) return false;
    if (!d.expiresAt) return false;
    const expTime = new Date(d.expiresAt).getTime();
    const timeLeft = expTime - now;
    return timeLeft > 0 && timeLeft <= 24 * 3600 * 1000;
  });

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'ALL') return true;
    return l.type === logFilter;
  });

  const formatRemainingTime = (isoString: string) => {
    const diff = new Date(isoString).getTime() - now;
    if (diff <= 0) return 'Sudah expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours} jam ${mins} mnt lagi`;
    return `${mins} menit lagi`;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Ringkasan Sistem Kepoin
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pantau status operasional platform, laporan pelanggaran, dan aktivitas komunitas terkini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/reports"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              pendingReports.length > 0
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert size={15} />
            <span>{pendingReports.length} Laporan Pending</span>
          </Link>
          <Link
            to="/admin/asks"
            className="px-4 py-2 bg-[#12A889] hover:bg-[#12A889] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#12A889]/20 flex items-center gap-1.5"
          >
            <span>Kelola Asks</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* 6 Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Users */}
        <Link to="/admin/users" className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-5 rounded-2xl transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
            <Users size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-white">{allUsers.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            Terdaftar & Aktif
          </p>
        </Link>

        {/* Asks Aktif */}
        <Link to="/admin/asks" className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-5 rounded-2xl transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Asks Aktif</span>
            <HelpCircle size={16} className="text-orange-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-white">{activeAsks.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            dari {drops.length} total Kepoan
          </p>
        </Link>

        {/* Answers Hari Ini */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Answers 24h</span>
            <MessageSquare size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{answersToday.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total {allResponses.length} respons
          </p>
        </div>

        {/* Talks Hari Ini */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Talks 24h</span>
            <MessagesSquare size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{talksTodayCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Interaksi obrolan
          </p>
        </div>

        {/* Reports Pending */}
        <Link to="/admin/reports" className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-5 rounded-2xl transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reports</span>
            <ShieldAlert size={16} className={pendingReports.length > 0 ? 'text-red-400' : 'text-slate-500'} />
          </div>
          <p className={`text-2xl font-black ${pendingReports.length > 0 ? 'text-red-400' : 'text-white'}`}>
            {pendingReports.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {reports.length - pendingReports.length} terselesaikan
          </p>
        </Link>

        {/* Content Expiring Soon */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Expiring &lt;24h</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{expiringSoon.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Akan otomatis arsip
          </p>
        </div>
      </div>

      {/* Two Column Layout: Expiring Soon & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Content yang Akan Expired */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Akan Expired (&lt;24 Jam)
              </h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              {expiringSoon.length} Asks
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {expiringSoon.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                Tidak ada konten yang akan expired dalam 24 jam ke depan.
              </div>
            ) : (
              expiringSoon.map((drop) => {
                const respCount = storage.getResponses(drop.id).length;
                return (
                  <div
                    key={drop.id}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#12A889]/10 text-orange-400 uppercase">
                        {drop.type}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                        <Clock size={12} />
                        {drop.expiresAt ? formatRemainingTime(drop.expiresAt) : '3 hari'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-200 line-clamp-2 leading-relaxed">
                      {drop.prompt}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-850">
                      <span>{respCount} responses</span>
                      <Link
                        to={`/drop/${drop.slug}`}
                        target="_blank"
                        className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                      >
                        Lihat <ArrowUpRight size={11} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Aktivitas 24 Jam Terakhir */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-orange-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Aktivitas 24 Jam Terakhir
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'ASK', 'ANSWER', 'REPORT', 'USER', 'MODERATION'].map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setLogFilter(filterKey)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    logFilter === filterKey
                      ? 'bg-[#12A889] text-white shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                Belum ada catatan aktivitas untuk filter ini.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const badgeColor =
                  log.type === 'REPORT'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : log.type === 'MODERATION'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : log.type === 'ASK'
                    ? 'bg-[#12A889]/10 text-orange-400 border-[#12A889]/20'
                    : log.type === 'ANSWER'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

                return (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex items-start justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeColor}`}>
                          {log.type}
                        </span>
                        <p className="text-xs font-bold text-slate-200">{log.action}</p>
                      </div>
                      <p className="text-[12px] text-slate-400 leading-relaxed break-words">
                        {log.detail}
                      </p>
                      <p className="text-[10.5px] text-slate-500">
                        Oleh <span className="text-slate-300 font-semibold">{log.actor}</span>
                      </p>
                    </div>

                    <span className="text-[10.5px] text-slate-500 shrink-0 mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
