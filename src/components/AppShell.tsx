/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, MobileNav } from './Navigation';
import { LoginModal } from './LoginModal';
import { OnboardingModal } from './OnboardingModal';
import { storage } from '../lib/storage';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    // Sync with Supabase on app start
    storage.syncWithSupabase();

    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener('open-login-modal', handleOpenLogin);
    return () => window.removeEventListener('open-login-modal', handleOpenLogin);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-dark-bg text-charcoal dark:text-dark-text transition-colors flex">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 md:pb-0 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 pt-2 pb-6 sm:px-6 sm:pt-3 sm:pb-8 md:px-8 md:pt-4 md:pb-8 lg:px-10 lg:pt-4 lg:pb-10 w-full">
          {children}
        </div>
      </main>
      <MobileNav />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <OnboardingModal />
    </div>
  );
};
