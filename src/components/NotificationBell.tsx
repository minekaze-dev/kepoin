/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, MessageCircle, Sparkles, Image, Check } from 'lucide-react';
import { storage } from '../lib/storage';
import { AppNotification } from '../types';
import { useLanguage } from '../lib/i18n';

export const NotificationBell: React.FC = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
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

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('notification-updated', handleUpdate);
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

  const handleNotificationClick = (notif: AppNotification) => {
    storage.markNotificationAsRead(notif.id);
    loadNotifications();
    setIsOpen(false);
    navigate(notif.linkUrl);
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    storage.markAllNotificationsAsRead();
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
      return `${diffDay}h lalu`;
    } else {
      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      return `${diffDay}d ago`;
    }
  };

  const getTypeBadgeIcon = (type: string) => {
    switch (type) {
      case 'COMMENT':
        return <MessageCircle size={10} className="text-white" />;
      case 'RESPONSE':
        return <Image size={10} className="text-white" />;
      case 'REACTION':
        return <Sparkles size={10} className="text-white" />;
      default:
        return <Check size={10} className="text-white" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'COMMENT':
        return 'bg-blue-500';
      case 'RESPONSE':
        return 'bg-[#12A889]';
      case 'REACTION':
        return 'bg-pink-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={20} />
        
        {/* Red Badge Dot with Number */}
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-dark-bg animate-in fade-in zoom-in duration-200">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[320px] sm:w-[360px] bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-border bg-gray-50/70 dark:bg-dark-bg/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-gray-900 dark:text-dark-text">
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
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-[#12A889] dark:text-[#12A889] hover:underline flex items-center gap-1 cursor-pointer"
                title={lang === 'id' ? 'Tandai semua telah dibaca' : 'Mark all as read'}
              >
                <CheckCheck size={14} />
                <span>{lang === 'id' ? 'Tandai dibaca' : 'Mark all read'}</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-dark-border">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                  <Bell size={22} className="opacity-40" />
                </div>
                <p className="text-[13px] font-semibold text-gray-700 dark:text-dark-text">
                  {lang === 'id' ? 'Belum ada notifikasi' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5">
                  {lang === 'id' 
                    ? 'Saat ada yang merespons atau mengirim obrolan, infonya akan muncul di sini.' 
                    : 'When someone responds or talks on your shares, it will appear here.'}
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-[#12A889]/10 dark:hover:bg-[#12A889]/10 transition-colors cursor-pointer relative ${
                    !notif.read ? 'bg-[#12A889]/5 dark:bg-[#12A889]/5' : ''
                  }`}
                >
                  {/* Actor Avatar with Type Badge */}
                  <div className="relative shrink-0 mt-0.5">
                    <img
                      src={notif.actorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.actorName}`}
                      alt={notif.actorName}
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-border object-cover border border-gray-200 dark:border-dark-border"
                    />
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white dark:border-dark-surface ${getTypeBadgeColor(notif.type)}`}>
                      {getTypeBadgeIcon(notif.type)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-800 dark:text-dark-text leading-snug break-words">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {notif.actorName}
                      </span>{' '}
                      {notif.message}{' '}
                      <span className="text-[#12A889] dark:text-[#12A889] font-medium">
                        "{notif.dropPrompt}"
                      </span>
                    </p>
                    <span className="text-[11px] text-gray-400 dark:text-dark-muted font-medium mt-1 inline-block">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>

                  {/* Unread indicator dot */}
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
