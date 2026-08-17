/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  HelpCircle, 
  ShieldAlert, 
  Users, 
  Sliders, 
  Settings as SettingsIcon, 
  LogOut, 
  ArrowLeft, 
  Menu, 
  X, 
  ShieldCheck, 
  Clock,
  Sparkles,
  ExternalLink,
  Power,
  Megaphone,
  Globe
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { useLanguage } from '../../lib/i18n';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { lang, toggleLang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(storage.getIsAdmin());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Check auth
    if (!storage.getIsAdmin()) {
      navigate('/admin/login');
    }

    const updateAdminStatus = () => {
      const admin = storage.getIsAdmin();
      setIsAdmin(admin);
      if (!admin) navigate('/admin/login');
      const reports = storage.getReports();
      setPendingReportsCount(reports.filter(r => r.status === 'PENDING').length);
    };

    updateAdminStatus();
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);

    window.addEventListener('storage', updateAdminStatus);
    window.addEventListener('admin-auth-changed', updateAdminStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateAdminStatus);
      window.removeEventListener('admin-auth-changed', updateAdminStatus);
    };
  }, [navigate]);

  if (!isAdmin) {
    return null;
  }

  const platformSettings = storage.getPlatformSettings();

  const navItems = [
    {
      name: 'Overview',
      path: '/admin',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Asks',
      path: '/admin/asks',
      icon: HelpCircle,
      badge: null,
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: ShieldAlert,
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: Users,
      badge: null,
    },
    {
      name: 'Moderation',
      path: '/admin/moderation',
      icon: Sliders,
      badge: null,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: SettingsIcon,
      badge: null,
    },
    {
      name: 'Pengumuman',
      path: '/admin/announcements',
      icon: Megaphone,
      badge: null,
    },
  ];

  const handleLogout = () => {
    storage.logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-[#12A889] selection:text-white">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#12A889] flex items-center justify-center text-white font-black shadow-md shadow-[#12A889]/20">
            K
          </div>
          <div>
            <span className="font-black text-sm text-white tracking-tight">KEPOIN ADMIN</span>
            <p className="text-[10px] text-orange-400 font-bold -mt-0.5">Control Center</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-5 z-50 transition-transform duration-200 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#12A889] to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-[#12A889]/25">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="font-black text-base text-white tracking-tight">KEPOIN</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-400">Panel Admin</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick System Badge */}
          {platformSettings.maintenanceMode ? (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-[11px] font-bold text-red-400 flex items-center gap-2">
              <Power size={13} className="shrink-0" />
              <span>Maintenance Mode ON</span>
            </div>
          ) : (
            <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Sistem Normal & Aktif</span>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#12A889] text-white shadow-md shadow-[#12A889]/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions in Sidebar */}
        <div className="space-y-3 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => toggleLang(lang === 'en' ? 'id' : 'en')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-700"
          >
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-[#12A889]" />
              <span>{lang === 'en' ? 'English (EN)' : 'Indonesia (ID)'}</span>
            </div>
          </button>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-700"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/20 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Keluar Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Desktop Bar */}
        <header className="hidden md:flex bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-8 py-4 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">
              Panel Pengawasan Kepoin
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-orange-400">
              {navItems.find((n) => n.path === location.pathname)?.name || 'Admin'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-500" />
              <span>{currentTime} WIB</span>
            </span>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#12A889]/20 border border-[#12A889]/40 text-orange-400 font-bold flex items-center justify-center text-xs">
                A
              </div>
              <span className="text-slate-200 font-bold">Admin Kepoin</span>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
