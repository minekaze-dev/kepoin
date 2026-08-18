/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Plus, 
  StickyNote, 
  Bookmark, 
  User, 
  Settings,
  Sun,
  Moon,
  Globe,
  ChevronLeft,
  LogOut,
  Flag,
  ShieldCheck
} from 'lucide-react';
import { storage } from '../lib/storage';
import { useLanguage } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { ReportModal } from './ReportModal';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isRestrictedForGuest?: boolean;
}

const SidebarItem = ({ to, icon: Icon, label, isRestrictedForGuest, isCollapsed }: SidebarItemProps & { isCollapsed: boolean }) => {
  const navigate = useNavigate();
  const isLoggedIn = storage.getIsLoggedIn();

  const handleClick = (e: React.MouseEvent) => {
    if (isRestrictedForGuest && !isLoggedIn) {
      e.preventDefault();
      window.dispatchEvent(new Event('open-login-modal'));
    }
  };

  return (
    <div className={`flex items-center relative group ${isCollapsed ? 'justify-center' : ''}`} onClick={handleClick}>
      <NavLink
        to={isLoggedIn || !isRestrictedForGuest ? to : '#'}
        className={({ isActive }) => `
          flex items-center transition-colors text-[14px] z-10
          ${isCollapsed 
            ? 'w-10 h-10 rounded-full justify-center' 
            : 'flex-1 gap-3 px-3 py-2.5 rounded-lg'
          }
          ${isLoggedIn && isActive
            ? 'bg-[#12A889]/10 text-[#12A889] font-medium' 
            : 'text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg'}
        `}
      >
        <Icon size={isCollapsed ? 20 : 18} />
        {!isCollapsed && <span>{label}</span>}
      </NavLink>
    </div>
  );
};

export const Sidebar = () => {
  const { t, lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const user = storage.getUser();
  const isLoggedIn = storage.getIsLoggedIn();
  const isAdmin = isLoggedIn && (user.role === 'ADMIN' || user.username?.toLowerCase() === '@admin' || user.username?.toLowerCase() === 'admin' || storage.getIsAdmin());

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sidebar cannot be collapsed for guest users
  const isCollapsedActual = isLoggedIn ? isCollapsed : false;

  return (
    <aside className={`hidden md:flex flex-col shrink-0 border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface h-screen sticky top-0 py-5 transition-all duration-300 ${isCollapsedActual ? 'w-[70px] items-center' : 'w-[255px] px-3.5'}`}>
      <div className={`flex items-center mb-7 ${isCollapsedActual ? 'justify-center px-0' : 'justify-between px-3.5'}`}>
        {!isCollapsedActual && (
          <Link 
            to="/" 
            onClick={(e) => { if (!isLoggedIn) { e.preventDefault(); window.dispatchEvent(new Event('open-login-modal')); } }}
          >
            <img src="https://imgur.com/nuEi5Xj.jpg" alt="Kepoin" className="w-28 h-auto object-contain" />
          </Link>
        )}
        {isLoggedIn && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={`transition-transform ${isCollapsedActual ? 'rotate-180' : ''}`} size={20} />
          </button>
        )}
      </div>

      <nav className={`flex flex-col gap-1 relative ${isCollapsedActual ? 'items-center' : 'px-1'}`}>
        <SidebarItem to="/" icon={Home} label={t.nav.home} isCollapsed={isCollapsedActual} />
        <SidebarItem to="/discover" icon={Compass} label={t.nav.discover} isCollapsed={isCollapsedActual} />
        
        <div 
          className="flex items-center relative group" 
          onClick={(e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              window.dispatchEvent(new Event('open-login-modal'));
            }
          }}
        >
          <NavLink
            to={isLoggedIn ? "/create" : "#"}
            className={`flex items-center ${isCollapsedActual ? 'justify-center w-10 h-10 rounded-full' : 'gap-3 px-4 rounded-xl flex-1 justify-start'} bg-[#12A889] hover:bg-[#12A889]/90 text-white py-2.5 transition-all z-10 font-bold shadow-md shadow-[#12A889]/20 text-[14px] mt-1 mb-2`}
          >
            <Plus size={isCollapsedActual ? 20 : 18} strokeWidth={3} />
            {!isCollapsedActual && <span>{t.nav.create}</span>}
          </NavLink>
        </div>

        {!isLoggedIn && (
          <div className="space-y-1.5 px-1 my-1">
            <button 
              onClick={() => window.dispatchEvent(new Event('open-login-modal'))}
              className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:border-[#12A889] text-charcoal dark:text-dark-text py-2.5 px-3.5 rounded-xl text-[14px] font-bold shadow-sm transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-500 dark:text-dark-muted group-hover:text-[#12A889] transition-colors" />
                <span>{lang === 'en' ? 'Join Kepoin' : 'Ikut Kepoin'}</span>
              </div>
              <span className="text-[#12A889] group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
            <div className="text-[11px] text-gray-400 dark:text-dark-muted px-1 leading-relaxed">
              {lang === 'en' ? 'Curious? Join now' : 'Penasaran? Join sekarang'}
            </div>
          </div>
        )}

        {isLoggedIn && (
          <div className="flex flex-col gap-1">
            <SidebarItem to="/saved" icon={Bookmark} label={t.nav.saved} isCollapsed={isCollapsedActual} />
            
            <div className="flex flex-col gap-1">
              <SidebarItem to="/profile" icon={User} label={t.nav.profile} isCollapsed={isCollapsedActual} />
              <SidebarItem to="/settings" icon={Settings} label={t.nav.settings} isCollapsed={isCollapsedActual} />
            </div>
          </div>
        )}
      </nav>

      <div className="flex-1" />

      {!isLoggedIn && (
        <div className="mt-auto pt-3 relative z-10 space-y-2.5 border-t border-gray-100 dark:border-dark-border px-1">
          {/* Theme & Language Toggles */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-gray-50 hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-dark-border/80 border border-gray-200/70 dark:border-dark-border rounded-lg text-xs font-semibold text-gray-700 dark:text-dark-text transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun size={14} className="text-amber-400" />
              ) : (
                <Moon size={14} className="text-gray-600 dark:text-dark-muted" />
              )}
              <span className="text-[11px]">
                {theme === 'dark' ? (lang === 'id' ? 'Terang' : 'Light') : (lang === 'id' ? 'Gelap' : 'Dark')}
              </span>
            </button>

            <button
              onClick={toggleLang}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-gray-50 hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-dark-border/80 border border-gray-200/70 dark:border-dark-border rounded-lg text-xs font-semibold text-gray-700 dark:text-dark-text transition-colors cursor-pointer"
              title="Ganti Bahasa / Change Language"
            >
              <Globe size={14} className="text-[#12A889]" />
              <span className="text-[11px] font-bold uppercase">{lang === 'id' ? 'ID' : 'EN'}</span>
            </button>
          </div>

          {/* Report a Problem */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-gray-500 hover:text-red-500 dark:text-dark-muted dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <Flag size={12} />
            <span>{lang === 'id' ? 'Laporkan Masalah' : 'Report a Problem'}</span>
          </button>

          {/* Terms & Privacy Links & Copyright */}
          <div className="text-center space-y-1 pt-0.5">
            <div className="flex items-center justify-center gap-2 text-[10.5px] text-gray-400 dark:text-dark-muted font-medium">
              <Link 
                to="/terms" 
                className="hover:text-gray-700 dark:hover:text-dark-text hover:underline transition-colors"
              >
                {lang === 'id' ? 'Ketentuan' : 'Terms'}
              </Link>
              <span>•</span>
              <Link 
                to="/privacy" 
                className="hover:text-gray-700 dark:hover:text-dark-text hover:underline transition-colors"
              >
                {lang === 'id' ? 'Privasi' : 'Privacy'}
              </Link>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-dark-muted">
              © 2026 Kepoin
            </p>
          </div>
        </div>
      )}

      {isLoggedIn && (
        <div className={`mt-2 pt-3.5 relative z-10 bg-white dark:bg-dark-surface space-y-2 border-t border-gray-100 dark:border-dark-border ${isCollapsedActual ? 'flex flex-col items-center w-full' : 'px-2'}`}>
          {/* Admin Panel Quick Access Button (Above Super Admin) */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => storage.setIsAdmin(true)}
              className={`flex items-center transition-all ${
                isCollapsedActual 
                  ? 'w-10 h-10 rounded-xl justify-center bg-emerald-500/10 dark:bg-emerald-500/20 text-[#12A889] dark:text-emerald-400 hover:bg-[#12A889] hover:text-white dark:hover:bg-[#12A889] dark:hover:text-white mb-1 shadow-xs' 
                  : 'w-full gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-[#12A889] dark:bg-emerald-500/15 dark:hover:bg-[#12A889] border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:text-white dark:hover:text-white font-semibold text-[13px] shadow-sm mb-1.5 group transition-colors'
              }`}
              title={lang === 'en' ? 'Go to Admin Panel' : 'Masuk ke Admin Panel'}
            >
              <ShieldCheck size={isCollapsedActual ? 20 : 18} className="text-[#12A889] dark:text-emerald-400 group-hover:text-white transition-colors shrink-0" />
              {!isCollapsedActual && (
                <div className="flex items-center justify-between flex-1">
                  <span>{lang === 'en' ? 'Admin Panel' : 'Admin Panel'}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#12A889] text-white group-hover:bg-white group-hover:text-[#12A889] transition-colors">
                    Control
                  </span>
                </div>
              )}
            </Link>
          )}

          <div className={`flex items-center ${isCollapsedActual ? 'justify-center' : 'gap-3 px-2 py-1.5'}`}>
            <div className="relative shrink-0">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-bg"
              />
              {isAdmin && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#12A889] border-2 border-white dark:border-dark-surface rounded-full flex items-center justify-center text-[7px] text-white font-bold" title="Admin">
                  ✓
                </span>
              )}
            </div>
            {!isCollapsedActual && (
              <div className="flex flex-col overflow-hidden flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-charcoal dark:text-dark-text truncate">{user.name}</span>
                  {isAdmin && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      ADMIN
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-400 dark:text-dark-muted truncate">{user.username}</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => { storage.setIsLoggedIn(false); storage.setIsAdmin(false); window.location.reload(); }}
            className={`flex items-center justify-center rounded-full transition-colors ${isCollapsedActual ? 'w-10 h-10 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'w-full gap-2 bg-gray-50 dark:bg-dark-bg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-600 dark:text-dark-muted hover:text-red-600 dark:hover:text-red-400 text-[13px] font-medium py-2 px-3 border border-gray-100 dark:border-dark-border cursor-pointer'}`}
          >
            <LogOut size={18} />
            {!isCollapsedActual && <span>Log out</span>}
          </button>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="USER"
        targetId="guest_feedback"
        targetTitle="Kepoin Platform Feedback / Problem"
      />
    </aside>
  );
};

export const MobileNav = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const isLoggedIn = storage.getIsLoggedIn();

  // Hide if not logged in
  if (!isLoggedIn) return null;

  // Hide on public drop pages
  const isPublicDrop = location.pathname.startsWith('/drop/');
  if (isPublicDrop) return null;

  const handleCreateClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      window.dispatchEvent(new Event('open-login-modal'));
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      window.dispatchEvent(new Event('open-login-modal'));
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-t border-gray-200 dark:border-dark-border px-3 py-1.5 flex justify-around items-center z-50 transition-colors shadow-lg">
      <NavLink 
        to="/" 
        className={({ isActive }) => `flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${isActive ? 'text-[#12A889] font-semibold' : 'text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text'}`}
      >
        <Home size={20} />
        <span className="text-[10px] tracking-tight">{t.nav.home}</span>
      </NavLink>

      <NavLink 
        to="/discover" 
        className={({ isActive }) => `flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${isActive ? 'text-[#12A889] font-semibold' : 'text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text'}`}
      >
        <Compass size={20} />
        <span className="text-[10px] tracking-tight">{t.nav.discover}</span>
      </NavLink>

      {/* Large Round Orange Create Button */}
      <div className="relative -mt-5 flex flex-col items-center">
        <NavLink 
          to={isLoggedIn ? "/create" : "#"} 
          onClick={handleCreateClick}
          className={({ isActive }) => `
            w-12 h-12 rounded-full bg-[#12A889] hover:bg-[#12A889]/90 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-[#12A889]/35 border-2 border-white dark:border-dark-surface transition-all
            ${isActive ? 'ring-2 ring-[#12A889]/40 ring-offset-2 dark:ring-offset-dark-surface' : ''}
          `}
          aria-label={t.nav.create}
        >
          <Plus size={26} strokeWidth={3} />
        </NavLink>
      </div>

      <NavLink 
        to={isLoggedIn ? "/profile" : "#"} 
        onClick={handleProfileClick}
        className={({ isActive }) => `flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${isActive && isLoggedIn ? 'text-[#12A889] font-semibold' : 'text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text'}`}
      >
        <User size={20} />
        <span className="text-[10px] tracking-tight">{t.nav.me}</span>
      </NavLink>

      <NavLink 
        to="/settings" 
        className={({ isActive }) => `flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${isActive ? 'text-[#12A889] font-semibold' : 'text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text'}`}
      >
        <Settings size={20} />
        <span className="text-[10px] tracking-tight">{t.nav.settings}</span>
      </NavLink>
    </nav>
  );
};
