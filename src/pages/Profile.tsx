/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { DropBoard, UserProfile } from '../types';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Calendar, ExternalLink, MoreVertical, Trash2, Shield, Lock, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';

import { useLanguage } from '../lib/i18n';

export const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const currentUser = storage.getUser();
  
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [drops, setDrops] = useState<DropBoard[]>([]);
  const [savedDropIds, setSavedDropIds] = useState<string[]>(storage.getSavedDrops());
  const [activeMenuDropId, setActiveMenuDropId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [dropToDelete, setDropToDelete] = useState<string | null>(null);

  const handleToggleSave = (dropId: string) => {
    storage.toggleSaveDrop(dropId);
    setSavedDropIds(storage.getSavedDrops());
  };

  useEffect(() => {
    let targetUser: UserProfile | undefined;
    
    if (!username) {
      targetUser = currentUser;
      setIsOwnProfile(true);
    } else {
      targetUser = storage.getUserByUsername(username);
      setIsOwnProfile(targetUser?.id === currentUser.id);
    }

    if (targetUser) {
      setProfileUser(targetUser);
      // Filter drops based on owner
      const allDrops = storage.getDrops();
      const userDrops = allDrops.filter(d => d.ownerId === targetUser?.id);
      setDrops(userDrops);
    }
  }, [username, currentUser.id]);

  const handleDeleteDrop = () => {
    if (dropToDelete) {
      storage.deleteDrop(dropToDelete);
      setDrops(drops.filter(d => d.id !== dropToDelete));
      setDropToDelete(null);
      setActiveMenuDropId(null);
    }
  };

  const totalResponses = drops.reduce((acc, drop) => acc + storage.getResponses(drop.id).length, 0);
  const savedCount = storage.getSavedDrops().length;

  const getTotalTalks = (dropId: string) => {
    return storage.getResponses(dropId).reduce((acc, r) => acc + (r.talks?.length || 0), 0);
  };

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mb-4">
          <SettingsIcon className="text-gray-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">User Not Found</h2>
        <p className="text-gray-500 dark:text-dark-muted mt-1">This user doesn't exist or has changed their username.</p>
        <button onClick={() => navigate('/')} className="mt-6 text-[#12A889] font-bold underline">Go Home</button>
      </div>
    );
  }

  const isPrivateAndNotOwn = profileUser.isPrivate && !isOwnProfile;

  return (
    <div className="w-full space-y-8">
      {/* Profile Header */}
      <header className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
          <div className="relative shrink-0">
            <img 
              src={profileUser.avatar} 
              alt={profileUser.name} 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-gray-50 dark:bg-dark-bg border-2 border-white dark:border-dark-border shadow-md object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-charcoal dark:text-dark-text tracking-tight">{profileUser.name}</h1>
                  {profileUser.isPrivate && (
                    <span className="p-1 bg-orange-50 dark:bg-[#12A889]/10 text-[#12A889] rounded-lg">
                      <Shield size={18} />
                    </span>
                  )}
                </div>
                <p className="text-[#12A889] font-bold text-[15px]">{profileUser.username}</p>
              </div>

              {isOwnProfile && (
                <Link 
                  to="/profile/edit"
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-dark-border px-5 py-2.5 rounded-xl text-[13.5px] font-bold dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg hover:border-orange-200 dark:hover:border-[#12A889]/30 transition-all shadow-xs"
                >
                  <SettingsIcon size={16} />
                  {t.profile.editBtn}
                </Link>
              )}
            </div>
            
            <p className="text-[14.5px] text-gray-600 dark:text-dark-muted max-w-2xl leading-relaxed">
              {profileUser.bio || (lang === 'id' ? 'Belum ada bio.' : 'No bio yet.')}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[13px] text-gray-400 dark:text-dark-muted">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={14} /> Joined {new Date(profileUser.joinedAt || '2026-08-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-8 sm:gap-12 pt-3 border-t border-gray-100 dark:border-dark-border/60">
              <div className="text-center md:text-left">
                <p className="text-xl sm:text-2xl font-black text-charcoal dark:text-dark-text">{drops.length}</p>
                <p className="text-[11px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest mt-0.5">{t.profile.stats.drops}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xl sm:text-2xl font-black text-charcoal dark:text-dark-text">{totalResponses.toLocaleString()}</p>
                <p className="text-[11px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest mt-0.5">{t.profile.stats.responses}</p>
              </div>
              {isOwnProfile && (
                <div className="text-center md:text-left">
                  <p className="text-xl sm:text-2xl font-black text-charcoal dark:text-dark-text">{savedCount}</p>
                  <p className="text-[11px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest mt-0.5">{t.profile.stats.saved}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {isPrivateAndNotOwn ? (
        <div className="bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Lock size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">Account is Private</h2>
          <p className="text-gray-500 dark:text-dark-muted mt-2 max-w-sm">This user has set their account to private. You cannot see their drops.</p>
        </div>
      ) : (
        /* User's Drops */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-bold dark:text-dark-text">
              {isOwnProfile ? t.profile.recentDrops : `${profileUser.name}'s Drops`}
            </h2>
            <span className="text-[13px] text-gray-400 dark:text-dark-muted font-medium">
              {drops.length} {drops.length === 1 ? 'drop' : 'drops'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drops.length === 0 ? (
              <div className="col-span-full py-14 text-center text-gray-500 dark:text-dark-muted bg-white dark:bg-dark-surface rounded-2xl border border-dashed border-gray-200 dark:border-dark-border">
                {lang === 'id' ? 'Belum ada postingan/drop.' : 'No drops yet.'}
              </div>
            ) : (
              drops.map(drop => (
                <div key={drop.id} className="relative group flex flex-col">
                  <Link 
                    to={`/drop/${drop.slug}`}
                    className="flex flex-col justify-between h-full bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-5 rounded-2xl hover:border-orange-300 dark:hover:border-[#12A889]/50 hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3 pr-6">
                        <span className="bg-orange-50 dark:bg-[#12A889]/10 text-[#12A889] dark:text-[#12A889] px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          {t.create.types[drop.type.toUpperCase() as keyof typeof t.create.types] || drop.type}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11.5px] text-gray-400 dark:text-dark-muted flex gap-1.5 items-center font-medium">
                            <span>{storage.getResponses(drop.id).length} {lang === 'en' ? (storage.getResponses(drop.id).length === 1 ? 'answer' : 'answers') : 'jawaban'}</span>
                            <span>·</span>
                            <span>{getTotalTalks(drop.id)} {lang === 'en' ? (getTotalTalks(drop.id) === 1 ? 'talk' : 'talks') : 'obrolan'}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        {drop.coverImage && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-dark-border shadow-xs">
                            <img src={drop.coverImage} alt="preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[15px] sm:text-[16px] text-charcoal dark:text-dark-text group-hover:text-[#12A889] transition-colors line-clamp-2 leading-snug">
                            {drop.prompt}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-dark-border/60 flex items-center justify-between">
                      <span className="text-[11.5px] text-gray-400 dark:text-dark-muted">
                        {t.profile.created} {new Date(drop.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[12px] font-bold text-[#12A889] dark:text-orange-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        {t.profile.view} <ExternalLink size={13} />
                      </span>
                    </div>
                  </Link>
                  
                  {isOwnProfile && (
                    <div className="absolute top-3.5 right-3.5 z-10">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveMenuDropId(activeMenuDropId === drop.id ? null : drop.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-charcoal dark:hover:text-dark-text bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xs rounded-lg border border-gray-100 dark:border-dark-border hover:border-gray-200 transition-all cursor-pointer shadow-xs"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeMenuDropId === drop.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-xl py-1 z-20 animate-in fade-in">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleSave(drop.id);
                              setActiveMenuDropId(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <Bookmark 
                              size={14} 
                              className={savedDropIds.includes(drop.id) ? "text-[#12A889] fill-[#12A889]" : "text-gray-400"} 
                            />
                            {savedDropIds.includes(drop.id) 
                              ? (lang === 'id' ? 'Batal Simpan' : 'Unsave')
                              : (lang === 'id' ? 'Simpan' : 'Save')}
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDropToDelete(drop.id);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            {lang === 'id' ? 'Hapus' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}
      {/* Delete Confirmation Modal */}
      {dropToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-dark-surface rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-dark-border text-center"
          >
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">
              {lang === 'id' ? 'Hapus Kiriman?' : 'Delete Share?'}
            </h3>
            <p className="text-gray-500 dark:text-dark-muted mb-8 leading-relaxed">
              {lang === 'id' ? 'Tindakan ini tidak bisa dibatalkan. Semua data terkait kiriman ini akan hilang.' : 'This action cannot be undone. All data related to this share will be lost.'}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteDrop}
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20"
              >
                {lang === 'id' ? 'Ya, Hapus' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDropToDelete(null)}
                className="w-full py-3.5 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-border text-gray-600 dark:text-dark-text font-bold rounded-2xl transition-all"
              >
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
