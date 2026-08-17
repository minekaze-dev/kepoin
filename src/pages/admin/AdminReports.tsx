/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Filter, 
  Search,
  ExternalLink,
  MessageSquare,
  UserX,
  FileText
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { ReportItem, ReportTargetType, ReportStatus } from '../../types';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'IGNORED'>('PENDING');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{
    report: ReportItem;
    action: 'HIDDEN' | 'DELETED' | 'IGNORED' | 'BANNED_USER';
  } | null>(null);

  useEffect(() => {
    loadReports();
    const handleUpdate = () => loadReports();
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  const loadReports = () => {
    setReports(storage.getReports());
  };

  const handleExecuteAction = () => {
    if (!actionConfirm) return;
    const { report, action } = actionConfirm;
    storage.resolveReportWithAction(report.id, action);
    setActionConfirm(null);
    setSelectedReport(null);
    loadReports();
  };

  const filteredReports = reports.filter((rep) => {
    if (statusFilter !== 'ALL' && rep.status !== statusFilter) return false;
    if (targetTypeFilter !== 'ALL' && rep.targetType !== targetTypeFilter) return false;
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'SPAM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PROFANITY':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'HARASSMENT':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HATE_SPEECH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'INAPPROPRIATE':
        return 'bg-[#12A889]/10 text-orange-400 border-[#12A889]/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Pusat Moderasi & Laporan (Reports)
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tinjau aduan pelanggaran dari pengguna terhadap Ask, Jawaban, Obrolan (Talks), dan Akun User.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 font-bold">
            Total Laporan: {reports.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['PENDING', 'ALL', 'RESOLVED', 'IGNORED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === st
                  ? 'bg-[#12A889] text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{st === 'PENDING' ? 'Perlu Ditinjau (Pending)' : st === 'ALL' ? 'Semua' : st === 'RESOLVED' ? 'Selesai' : 'Diabaikan'}</span>
              {st === 'PENDING' && pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Target Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">Tipe:</span>
          {['ALL', 'ASK', 'ANSWER', 'TALK', 'USER'].map((t) => (
            <button
              key={t}
              onClick={() => setTargetTypeFilter(t)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                targetTypeFilter === t
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900 border border-dashed border-slate-800 rounded-3xl space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500/40" />
            <p className="text-sm font-bold text-slate-300">Tidak ada laporan dalam antrean</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Semua laporan telah diproses dan sistem berjalan dengan tertib.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all space-y-4 ${
                report.status === 'PENDING'
                  ? 'border-slate-800 hover:border-slate-700 shadow-md'
                  : 'border-slate-850/60 opacity-75'
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {report.targetType}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${getReasonBadge(report.reason)}`}>
                    {report.reason}
                  </span>
                  <span className="text-xs text-slate-400">
                    Dilaporkan oleh <span className="font-semibold text-slate-200">{report.reportedBy}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={13} />
                  <span>{new Date(report.createdAt).toLocaleString()}</span>
                  {report.status === 'RESOLVED' && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      TINDAKAN: {report.actionTaken}
                    </span>
                  )}
                  {report.status === 'IGNORED' && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                      DIABAIKAN
                    </span>
                  )}
                </div>
              </div>

              {/* Target Content Snippet */}
              <div className="p-4 bg-slate-950/70 border border-slate-850 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText size={14} className="text-orange-400" />
                    <span>{report.targetTitle || 'Konten Target'}</span>
                  </p>
                  {report.targetOwnerUsername && (
                    <span className="text-[11px] text-orange-400 font-semibold">
                      Pemilik: {report.targetOwnerUsername}
                    </span>
                  )}
                </div>

                {report.targetContent && (
                  <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                    "{report.targetContent}"
                  </p>
                )}

                {report.description && (
                  <p className="text-[11.5px] text-slate-400 pt-1">
                    <strong className="text-slate-300">Catatan Pelapor:</strong> {report.description}
                  </p>
                )}
              </div>

              {/* Action Buttons: Review -> Hide -> Delete -> Ignore -> Ban User */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye size={14} />
                  <span>Review Detail</span>
                </button>

                {report.status === 'PENDING' ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Hide Button */}
                    <button
                      onClick={() => setActionConfirm({ report, action: 'HIDDEN' })}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <EyeOff size={13} />
                      <span>Hide Konten</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setActionConfirm({ report, action: 'DELETED' })}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete Konten</span>
                    </button>

                    {/* Ignore Button */}
                    <button
                      onClick={() => setActionConfirm({ report, action: 'IGNORED' })}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle size={13} />
                      <span>Ignore</span>
                    </button>

                    {/* Ban User Button */}
                    <button
                      onClick={() => setActionConfirm({ report, action: 'BANNED_USER' })}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-rose-600/30"
                    >
                      <Ban size={13} />
                      <span>Ban User</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    Laporan sudah ditindaklanjuti pada {report.reviewedAt ? new Date(report.reviewedAt).toLocaleDateString() : 'hari ini'}.
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-red-400" />
                <h3 className="text-base font-black text-white">
                  Detail Laporan #{selectedReport.id}
                </h3>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getReasonBadge(selectedReport.reason)}`}>
                {selectedReport.reason}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">Tipe Target</p>
                <p className="text-slate-200 font-semibold mt-0.5">{selectedReport.targetType} (ID: {selectedReport.targetId})</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">Judul / Subjek</p>
                <p className="text-white font-bold text-sm mt-0.5">{selectedReport.targetTitle}</p>
              </div>

              {selectedReport.targetContent && (
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">Isi Konten Asli</p>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 italic mt-1 leading-relaxed">
                    "{selectedReport.targetContent}"
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">Pemilik Konten</p>
                  <p className="text-orange-400 font-bold mt-0.5">{selectedReport.targetOwnerUsername || 'Anonim'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">Pelapor</p>
                  <p className="text-slate-300 font-bold mt-0.5">{selectedReport.reportedBy}</p>
                </div>
              </div>

              {selectedReport.description && (
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">Keterangan Tambahan Pelapor</p>
                  <p className="text-slate-300 mt-1 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {selectedReport.description}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Konfirmasi Tindakan: {actionConfirm.action}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {actionConfirm.action === 'HIDDEN' && 'Konten ini akan disembunyikan dari publik di Kepoin.'}
                {actionConfirm.action === 'DELETED' && 'Konten ini akan dihapus secara permanen dari sistem.'}
                {actionConfirm.action === 'IGNORED' && 'Laporan ini akan ditandai sebagai diabaikan tanpa mengubah konten.'}
                {actionConfirm.action === 'BANNED_USER' && `Akun pemilik konten (${actionConfirm.report.targetOwnerUsername || 'User'}) akan diblokir dari Kepoin.`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActionConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteAction}
                className="flex-1 py-2.5 rounded-xl bg-[#12A889] hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-md cursor-pointer"
              >
                Eksekusi Tindakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
