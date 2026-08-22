/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
}

export const Header = ({ title, subtitle, bannerTitle }: HeaderProps) => {
  const { t, lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
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
              <img src="https://imgur.com/5S09m0f.jpg" alt="Kepoin" className="w-40 h-auto object-contain -ml-1" />
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Search Input Always Visible */}
        <form 
          className="mr-1 hidden md:block"
          onSubmit={handleSearch}
        >
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-dark-surface border-none rounded-full text-sm focus:ring-2 focus:ring-primary dark:text-dark-text outline-none w-48"
            />
          </div>
        </form>

        {isLoggedIn && (
          <div className="flex items-center gap-1">
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
            <NotificationBell />
          </div>
        )}
      </div>
    </header>
  );
};
