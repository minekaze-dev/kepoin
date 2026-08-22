/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, MessageCircle, MessageSquare, AtSign, Flame, Clock, AlertTriangle, Sparkles, Check } from 'lucide-react';
import { storage } from '../lib/storage';
import { AppNotification, NotificationPriority } from '../types';
import { useLanguage } from '../lib/i18n';
import { supabase, fetchNotificationsFromSupabase } from '../lib/supabase';

export const NotificationBell: React.FC = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    if (!storage.getIsLoggedIn()) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    const userId = storage.getUser()?.id;
    if (userId) {
      // Try to fetch latest from Supabase and update local storage
      const remote = await fetchNotificationsFromSupabase(userId);
      if (remote) {
        localStorage.setItem('dropboard_notifications_v5', JSON.stringify(remote));
        window.dispatchEvent(new Event('storage'));
      }
    }

    const list = storage.getNotifications();
    setNotifications(list);
    setUnreadCount(list.filter(n => !n.read).length);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('notification-updated', handleUpdate);

    // Real-time listener
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        handleUpdate();
      })
      .subscribe();

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('notification-updated', handleUpdate);
      supabase.removeChannel(channel);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleBellClick = () => {
    // Rule 16: Guest cannot open personal notifications, redirect to login
    if (!storage.getIsLoggedIn()) {
      window.dispatchEvent(new Event('open-login-modal'));
      return;
    }
    setIsOpen(prev => !prev);
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    await storage.markNotificationAsRead(notif.id);
    loadNotifications();
    setIsOpen(false);
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await storage.markAllNotificationsAsRead();
    loadNotifications();
  };

  const formatTimeAgo = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (lang === 'id') {
      if (diffSec < 60) return 'Baru saja';
      if (diffMin < 60) return `${diffMin}m lalu`;
      if (diffHour < 24) return `${diffHour}j lalu`;
      if (diffDay === 1) return 'Kemarin';
      return `${diffDay}h lalu`;
    } else {
      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay === 1) return 'Yesterday';
      return `${diffDay}d ago`;
    }
  };

  const getTypeBadge = (notif: AppNotification) => {
    switch (notif.type) {
      case 'MENTION':
        return (
          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs border border-white dark:border-dark-surface">
            <AtSign size={10} />
          </span>
        );
      case 'TALK':
      case 'COMMENT':
        return (
          <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs border border-white dark:border-dark-surface">
            <MessageCircle size={10} />
          </span>
        );
      case 'ANSWER':
      case 'RESPONSE':
        return (
          <span className="w-5 h-5 rounded-full bg-[#12A889] text-white flex items-center justify-center shadow-xs border border-white dark:border-dark-surface">
            <MessageSquare size={10} />
          </span>
        );
      case 'REACTION_DROP':
      case 'REACTION_ANSWER':
      case 'REACTION':
        return (
          <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-xs border border-white dark:border-dark-surface">
            {notif.emoji || '❤️'}
          </span>
        );
      case 'EXPIRING_12H':
      case 'EXPIRING_1H':
        return (
          <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs border border-white dark:border-dark-surface">
            <Clock size={10} />
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xs border border-white dark:border-dark-surface">
            <AlertTriangle size={10} />
          </span>
        );
      default:
        return (
          <span className="w-5 h-5 rounded-full bg-gray-500 text-white flex items-center justify-center shadow-xs border border-white dark:border-dark-surface">
            <Check size={10} />
          </span>
        );
    }
  };

  const filteredNotifications = notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        id="notification-bell-btn"
        onClick={handleBellClick}
        className="relative p-2 text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={20} />
        
        {/* Red Badge Dot with Number (Rule 10) */}
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-dark-bg animate-in fade-in zoom-in duration-200">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-gray-100 dark:border-dark-border bg-gray-50/80 dark:bg-dark-bg/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[15px] text-gray-900 dark:text-dark-text">
                  {lang === 'id' ? 'Notifikasi' : 'Notifications'}
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} {lang === 'id' ? 'baru' : 'new'}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  id="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-semibold text-[#12A889] dark:text-[#12A889] hover:underline flex items-center gap-1 cursor-pointer"
                  title={lang === 'id' ? 'Tandai semua telah dibaca' : 'Mark all as read'}
                >
                  <CheckCheck size={14} />
                  <span>{lang === 'id' ? 'Tandai dibaca' : 'Mark all read'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-dark-border">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-2.5 text-gray-400">
                  <Bell size={22} className="opacity-40" />
                </div>
                <p className="text-[13px] font-semibold text-gray-700 dark:text-dark-text">
                  {lang === 'id' ? 'Belum ada notifikasi' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-1 max-w-[260px] mx-auto leading-relaxed">
                  {lang === 'id' 
                    ? 'Saat ada yang merespons, mengirim obrolan, atau memberi reaksi pada pertanyaanmu, infonya akan muncul di sini.' 
                    : 'When someone answers, joins talk, or reacts to your questions, you will be notified here.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  id={`notif-item-${notif.id}`}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-gray-50/80 dark:hover:bg-dark-bg/60 transition-colors cursor-pointer relative ${
                    !notif.read ? 'bg-[#12A889]/5 dark:bg-[#12A889]/10' : ''
                  }`}
                >
                  {/* Actor Avatar or System Icon */}
                  <div className="relative shrink-0 mt-0.5">
                    {notif.type === 'EXPIRED' || notif.type === 'EXPIRING_1H' || notif.type === 'EXPIRING_12H' ? (
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black border border-orange-200 dark:border-orange-900/40 text-xs">
                        {notif.type === 'EXPIRED' ? 'EXP' : notif.type === 'EXPIRING_1H' ? '1h' : '12h'}
                      </div>
                    ) : (
                      <img
                        src={notif.actorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.actorName || 'User'}`}
                        alt={notif.actorName || 'User'}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-border object-cover border border-gray-200 dark:border-dark-border"
                      />
                    )}
                    <span className="absolute -bottom-1 -right-1">
                      {getTypeBadge(notif)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-800 dark:text-dark-text leading-snug break-words">
                      {notif.message}
                    </p>
                    {notif.dropPrompt && (
                      <p className="text-[12px] text-[#12A889] dark:text-[#12A889] font-medium truncate mt-0.5">
                        "{notif.dropPrompt}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gray-400 dark:text-dark-muted font-medium">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                      {notif.priority === 'HIGH' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                          {lang === 'id' ? 'Utama' : 'Priority'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread indicator dot (Rule 10) */}
                  {!notif.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#12A889] shrink-0 mt-2 ring-2 ring-[#12A889]/20 dark:ring-[#12A889]/20" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

