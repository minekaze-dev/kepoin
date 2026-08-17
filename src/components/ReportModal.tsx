/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { ReportTargetType, ReportReason } from '../types';
import { storage } from '../lib/storage';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  targetContent?: string;
  targetOwnerName?: string;
  targetOwnerUsername?: string;
  targetOwnerId?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  targetContent,
  targetOwnerName,
  targetOwnerUsername,
  targetOwnerId,
}) => {
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = storage.getUser();
    const isLoggedIn = storage.getIsLoggedIn();
    const reportedBy = isLoggedIn ? currentUser.username : 'Anonim';

    storage.createReport({
      targetType,
      targetId,
      targetTitle: targetTitle || `${targetType} #${targetId.slice(0, 8)}`,
      targetContent,
      targetOwnerName,
      targetOwnerUsername,
      targetOwnerId,
      reportedBy,
      reporterId: isLoggedIn ? currentUser.id : undefined,
      reason,
      description: description.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      onClose();
    }, 1800);
  };

  const reasonLabels: Record<ReportReason, { title: string; desc: string }> = {
    SPAM: {
      title: 'Spam atau Promosi Tak Diinginkan',
      desc: 'Link affiliate, iklan bot, atau postingan massal berulang.',
    },
    PROFANITY: {
      title: 'Kata Kasar & Vulgar',
      desc: 'Ujaran kotor, umpatan, atau konten tidak pantas.',
    },
    HARASSMENT: {
      title: 'Pelecehan atau Cyberbullying',
      desc: 'Menyerang secara personal, menghina, atau mengancam.',
    },
    HATE_SPEECH: {
      title: 'Ujaran Kebencian (SARA)',
      desc: 'Diskriminasi ras, agama, suku, atau golongan.',
    },
    INAPPROPRIATE: {
      title: 'Konten Tidak Pantas / Asusila',
      desc: 'Gambar eksplisit, materi dewasa, atau melanggar norma.',
    },
    OTHER: {
      title: 'Pelanggaran Lainnya',
      desc: 'Pelanggaran ketentuan komunitas lainnya.',
    },
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-charcoal dark:hover:text-dark-text rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-charcoal dark:text-dark-text tracking-tight">
              Laporan Berhasil Terkirim
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-muted max-w-sm mx-auto">
              Terima kasih! Tim moderasi akan segera meninjau laporan ini demi menjaga kenyamanan komunitas KEPOIN.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-charcoal dark:text-dark-text tracking-tight">
                  Laporkan {targetType === 'ASK' ? 'Ask (Drop)' : targetType === 'ANSWER' ? 'Jawaban' : targetType === 'TALK' ? 'Obrolan' : 'Pengguna'}
                </h3>
                <p className="text-xs text-gray-400 dark:text-dark-muted">
                  Bantu kami menjaga Kepoin tetap aman dan nyaman
                </p>
              </div>
            </div>

            {/* Target Snippet */}
            {(targetTitle || targetContent) && (
              <div className="p-3.5 bg-gray-50 dark:bg-dark-bg/60 rounded-2xl border border-gray-100 dark:border-dark-border text-xs text-gray-600 dark:text-dark-muted">
                <p className="font-bold text-charcoal dark:text-dark-text mb-0.5 line-clamp-1">
                  {targetTitle || 'Konten yang dilaporkan'}
                </p>
                {targetContent && (
                  <p className="line-clamp-2 text-gray-500 dark:text-gray-400 italic">
                    "{targetContent}"
                  </p>
                )}
                {targetOwnerUsername && (
                  <p className="mt-1 text-[11px] text-[#12A889] font-semibold">
                    Pemilik: {targetOwnerUsername}
                  </p>
                )}
              </div>
            )}

            {/* Reason selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                Pilih Alasan Laporan
              </label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {(Object.keys(reasonLabels) as ReportReason[]).map((key) => {
                  const item = reasonLabels[key];
                  const isSelected = reason === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setReason(key)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-red-500 bg-red-50/50 dark:bg-red-500/10 text-charcoal dark:text-dark-text'
                          : 'border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text'
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-red-600 dark:text-red-400' : ''}`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-red-500 bg-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional details */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan lebih detail terkait pelanggaran ini..."
                rows={2}
                maxLength={300}
                className="w-full text-xs p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border focus:outline-none focus:border-red-500 text-charcoal dark:text-dark-text resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle size={14} />
                Kirim Laporan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
