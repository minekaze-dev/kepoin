import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Copy, Share2, Bookmark, AlertTriangle, Trash2, Check, ExternalLink } from 'lucide-react';
import { ReportTargetType } from '../types';
import { storage } from '../lib/storage';
import { ReportModal } from './ReportModal';

interface ContentMenuProps {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  targetContent?: string;
  targetOwnerName?: string;
  targetOwnerUsername?: string;
  targetOwnerId?: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onDeleted?: () => void;
  className?: string;
}

export const ContentMenu: React.FC<ContentMenuProps> = ({
  targetType,
  targetId,
  targetTitle,
  targetContent,
  targetOwnerName,
  targetOwnerUsername,
  targetOwnerId,
  isSaved,
  onToggleSave,
  onDeleted,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUser = storage.getUser();
  const isLoggedIn = storage.getIsLoggedIn();
  const isAdmin = localStorage.getItem('kepoin_is_admin') === 'true';
  
  // Check if current user is owner
  const isOwner = isLoggedIn && targetOwnerId && currentUser.id === targetOwnerId;
  const canDelete = isOwner || isAdmin;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = targetType === 'ASK' 
      ? `${window.location.origin}/drop/${targetId}`
      : `${window.location.origin}/drop/response/${targetId}`;
    
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1200);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = targetType === 'ASK' 
      ? `${window.location.origin}/drop/${targetId}`
      : `${window.location.origin}/drop/response/${targetId}`;

    if (navigator.share) {
      navigator.share({
        title: targetTitle || 'KEPOIN Drop',
        text: targetContent || 'Lihat kiriman ini di KEPOIN',
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Yakin ingin menghapus konten ini?')) return;

    if (targetType === 'ASK') {
      storage.deleteDrop(targetId);
    } else if (targetType === 'ANSWER') {
      storage.deleteResponseByAdmin(targetId);
    }
    setIsOpen(false);
    if (onDeleted) onDeleted();
    window.location.reload();
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors cursor-pointer"
        aria-label="Opsi konten"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center gap-2.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-gray-400" />}
            <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center gap-2.5 transition-colors"
          >
            <Share2 size={14} className="text-gray-400" />
            <span>Bagikan...</span>
          </button>

          {/* Bookmark (for Asks) */}
          {targetType === 'ASK' && onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center gap-2.5 transition-colors"
            >
              <Bookmark size={14} className={isSaved ? 'text-[#12A889] fill-[#12A889]' : 'text-gray-400'} />
              <span>{isSaved ? 'Hapus dari Tersimpan' : 'Simpan Postingan'}</span>
            </button>
          )}

          <div className="my-1 border-t border-gray-100 dark:border-dark-border" />

          {/* Report option (for non-owners only) */}
          {!isOwner && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setIsReportOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
              >
                <AlertTriangle size={14} className="text-red-500" />
                <span>Laporkan Konten</span>
              </button>
            </>
          )}

          {/* Delete option if owner or admin */}
          {canDelete && (
            <>
              <div className="my-1 border-t border-gray-100 dark:border-dark-border" />
              <button
                type="button"
                onClick={handleDelete}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
              >
                <Trash2 size={14} className="text-red-500" />
                <span>Hapus Konten</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetTitle={targetTitle}
        targetContent={targetContent}
        targetOwnerName={targetOwnerName}
        targetOwnerUsername={targetOwnerUsername}
        targetOwnerId={targetOwnerId}
      />
    </div>
  );
};
