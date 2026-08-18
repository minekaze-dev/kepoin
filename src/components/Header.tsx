/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { useLanguage } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  bannerTitle?: string;
  showSearch?: boolean;
}

export const Header = ({ title, subtitle, bannerTitle, showSearch = true }: HeaderProps) => {
  const { t, lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isLoggedIn = storage.getIsLoggedIn();

  return (
    <header className="flex justify-between items-center h-12 mb-6">
      {!isSearchOpen ? (
        <div className="flex-1 min-w-0">
          {title ? (
            <div>
              <h1 className="text-2xl md:text-[28px] font-bold text-charcoal dark:text-dark-text tracking-tight truncate">{title}</h1>
              {subtitle && <p className="text-[14px] text-gray-500 dark:text-dark-muted truncate">{subtitle}</p>}
            </div>
          ) : bannerTitle ? (
             <div className="hidden md:block">
               <h1 className="text-[12px] md:text-[14px] text-gray-500 dark:text-dark-muted uppercase tracking-wider font-bold leading-relaxed whitespace-nowrap">
                 {bannerTitle}
               </h1>
             </div>
          ) : (
            <div className="block md:hidden">
              <Link to="/">
                <img src="https://imgur.com/nuEi5Xj.jpg" alt="Kepoin" className="w-36 h-auto object-contain -ml-1" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center">
          {/* Toggles to the left of search input on desktop when search is active */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1 mr-3 border-r border-gray-100 dark:border-dark-border pr-2">
              <button
                onClick={() => toggleTheme()}
                className="p-1.5 text-gray-400 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors cursor-pointer"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => toggleLang()}
                className="p-1.5 text-[#12A889] font-black text-[12px] hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors cursor-pointer uppercase"
                title="Switch Language"
              >
                {lang}
              </button>
            </div>
          )}
          <form 
            className="flex-1 mr-3"
            onSubmit={handleSearch}
          >
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search kepoan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-dark-surface border-none rounded-full text-sm focus:ring-2 focus:ring-primary dark:text-dark-text outline-none"
                onBlur={() => {
                  if (!searchQuery) setIsSearchOpen(false);
                }}
              />
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-1">
        {/* Theme & Language Toggles - To the left of search (Desktop/Tablet Logged In) */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-1 mr-1">
            <button
              onClick={() => toggleTheme()}
              className="p-2 text-gray-400 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => toggleLang()}
              className="p-2 text-[#12A889] font-black text-[13px] hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors cursor-pointer uppercase"
              title="Switch Language"
            >
              {lang}
            </button>
          </div>
        )}

        {showSearch && !isSearchOpen && (
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-gray-400 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors cursor-pointer"
          >
            <Search size={20} />
          </button>
        )}

        {/* Theme & Language Toggles - Original position for mobile or guest */}
        {(!isLoggedIn || (isLoggedIn && !isSearchOpen)) && (
          <div className={`flex items-center gap-1 ${isLoggedIn ? 'md:hidden' : ''}`}>
            <button
              onClick={() => toggleTheme()}
              className="p-2 text-gray-400 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => toggleLang()}
              className="p-2 text-[#12A889] font-black text-xs hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors cursor-pointer uppercase"
              title="Switch Language"
            >
              {lang}
            </button>
          </div>
        )}

        {isLoggedIn && (
          <NotificationBell />
        )}
      </div>
    </header>
  );
};
