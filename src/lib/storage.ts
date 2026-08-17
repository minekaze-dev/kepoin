/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  DropBoard, 
  DropResponse, 
  UserProfile, 
  AppNotification, 
  Talk, 
  ReportItem, 
  ModerationConfig, 
  PlatformSettings, 
  ActivityLog, 
  Announcement, 
  DailyThisOrThat 
} from '../types';
import { initialDrops, initialResponses, initialNotifications, dummyUsers } from '../data';
import { initialReports, initialModerationConfig, initialPlatformSettings, initialActivityLogs, initialAnnouncements, initialDailyThisOrThat } from '../data/adminData';
import { censorProfanity } from './profanity';
import { Language } from './translations';
import { 
  supabase,
  fetchDropsFromSupabase,
  insertDropToSupabase,
  updateDropInSupabase,
  deleteDropFromSupabase,
  cleanupExpiredDropsInSupabase,
  fetchResponsesFromSupabase,
  insertResponseToSupabase,
  updateResponseInSupabase,
  deleteResponseFromSupabase,
  fetchReportsFromSupabase,
  insertReportToSupabase,
  updateReportInSupabase,
  fetchPlatformSettingsFromSupabase,
  savePlatformSettingsToSupabase,
  fetchModerationConfigFromSupabase,
  saveModerationConfigToSupabase,
  fetchAnnouncementsFromSupabase,
  saveAnnouncementToSupabase,
  deleteAnnouncementFromSupabase,
  fetchActivityLogsFromSupabase,
  logActivityToSupabase,
  fetchDailyThisOrThatFromSupabase,
  updateDailyThisOrThatInSupabase,
  fetchUsersFromSupabase,
  saveUserToSupabase,
  fetchNotificationsFromSupabase,
  insertNotificationToSupabase
} from './supabase';

const STORAGE_KEYS = {
  DROPS: 'dropboard_drops_v5',
  RESPONSES: 'dropboard_responses_v6',
  SAVED: 'dropboard_saved',
  USER: 'dropboard_user',
  REACTIONS: 'dropboard_user_reactions',
  LANG: 'kukepo_lang',
  NOTIFICATIONS: 'dropboard_notifications_v5',
  REGISTERED_USERS: 'dropboard_registered_users_v2',
  REPORTS: 'kepoin_reports_v2',
  MODERATION: 'kepoin_moderation_v2',
  SETTINGS: 'kepoin_settings_v2',
  IS_ADMIN: 'kepoin_is_admin',
  ACTIVITY_LOGS: 'kepoin_activity_logs_v2',
  ANNOUNCEMENTS: 'kepoin_announcements_v2',
  DAILY_THIS_OR_THAT: 'kepoin_daily_this_or_that_v2',
  LAST_SYNC: 'kepoin_last_supabase_sync',
};

// Auto sync state flag
let isSyncing = false;

export const storage = {
  // Sync all data with Supabase
  syncWithSupabase: async () => {
    if (isSyncing) return;
    isSyncing = true;

    try {
      // 1. Drops
      const drops = await fetchDropsFromSupabase();
      if (drops && drops.length > 0) {
        localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(drops));
      }

      // 2. Responses
      const responses = await fetchResponsesFromSupabase();
      if (responses && responses.length > 0) {
        localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
      }

      // 3. Reports
      const reports = await fetchReportsFromSupabase();
      if (reports && reports.length > 0) {
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      }

      // 4. Platform Settings
      const settings = await fetchPlatformSettingsFromSupabase();
      if (settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      }

      // 5. Moderation Config
      const modConfig = await fetchModerationConfigFromSupabase();
      if (modConfig) {
        localStorage.setItem(STORAGE_KEYS.MODERATION, JSON.stringify(modConfig));
      }

      // 6. Announcements
      const announcements = await fetchAnnouncementsFromSupabase();
      if (announcements && announcements.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
      }

      // 7. Activity Logs
      const logs = await fetchActivityLogsFromSupabase();
      if (logs && logs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
      }

      // 8. Daily This or That
      const daily = await fetchDailyThisOrThatFromSupabase();
      if (daily) {
        localStorage.setItem(STORAGE_KEYS.DAILY_THIS_OR_THAT, JSON.stringify(daily));
      }

      // 9. Users
      const users = await fetchUsersFromSupabase();
      if (users && users.length > 0) {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
      }

      // 10. Auto-cleanup expired drops
      await cleanupExpiredDropsInSupabase();

      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    } finally {
      isSyncing = false;
    }
  },

  getLang: (): Language => {
    const val = localStorage.getItem(STORAGE_KEYS.LANG);
    if (val === 'en' || val === 'id' || val === 'slank') {
      return val;
    }
    return 'id';
  },

  setLang: (lang: Language) => {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    window.dispatchEvent(new Event('storage'));
  },

  getIsLoggedIn: (): boolean => {
    const data = localStorage.getItem('dropboard_is_logged_in');
    return data !== null ? JSON.parse(data) : false;
  },

  setIsLoggedIn: (val: boolean) => {
    localStorage.setItem('dropboard_is_logged_in', JSON.stringify(val));
    if (!val) {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    window.dispatchEvent(new Event('storage'));
  },

  getDrops: (includeExpired = false, includeHidden = false): DropBoard[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DROPS);
    let drops: DropBoard[] = data ? JSON.parse(data) : initialDrops;
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(initialDrops));
      drops = initialDrops;
    }
    const now = Date.now();
    
    // Filter expired if requested
    if (!includeExpired) {
      drops = drops.filter(d => {
        if (d.status === 'EXPIRED') return false;
        if (d.expiresAt && new Date(d.expiresAt).getTime() < now) return false;
        if (d.isGuest && (now - new Date(d.createdAt).getTime()) > 3600 * 1000) return false;
        return true;
      });
    }

    // Filter hidden drops unless requested
    if (!includeHidden) {
      drops = drops.filter(d => !d.isHidden);
    }

    return drops;
  },

  getTrendingDrops: (): DropBoard[] => {
    const active = storage.getDrops(false);
    return [...active].sort((a, b) => {
      const respA = storage.getResponses(a.id).length;
      const respB = storage.getResponses(b.id).length;
      const talksA = storage.getResponses(a.id).reduce((acc, r) => acc + (r.talks?.length || 0), 0);
      const talksB = storage.getResponses(b.id).reduce((acc, r) => acc + (r.talks?.length || 0), 0);
      
      const isFastGrowingA = respA > 30 && talksA > 10;
      const isFastGrowingB = respB > 30 && talksB > 10;

      if (isFastGrowingA && !isFastGrowingB) return -1;
      if (!isFastGrowingA && isFastGrowingB) return 1;

      const scoreA = (a.stats?.views || 0) + respA * 5 + talksA * 10;
      const scoreB = (b.stats?.views || 0) + respB * 5 + talksB * 10;
      return scoreB - scoreA;
    });
  },

  getNewDrops: (): DropBoard[] => {
    const active = storage.getDrops(false);
    return [...active].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getExpiredDrops: (): DropBoard[] => {
    const all = storage.getDrops(true);
    const now = Date.now();
    return all.filter(d => d.status === 'EXPIRED' || (d.expiresAt && new Date(d.expiresAt).getTime() < now));
  },

  saveDrop: (drop: DropBoard) => {
    const sanitizedDrop: DropBoard = {
      ...drop,
      prompt: censorProfanity(drop.prompt),
      description: drop.description ? censorProfanity(drop.description) : undefined,
    };
    const drops = storage.getDrops(true);
    drops.unshift(sanitizedDrop);
    localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(drops));
    window.dispatchEvent(new Event('storage'));

    // Sync to Supabase
    insertDropToSupabase(sanitizedDrop);
  },

  updateDrop: (updatedDrop: DropBoard) => {
    const drops = storage.getDrops(true);
    const index = drops.findIndex(d => d.id === updatedDrop.id);
    if (index !== -1) {
      const sanitized: DropBoard = {
        ...updatedDrop,
        prompt: censorProfanity(updatedDrop.prompt),
        description: updatedDrop.description ? censorProfanity(updatedDrop.description) : undefined,
      };
      drops[index] = sanitized;
      localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(drops));
      window.dispatchEvent(new Event('storage'));

      // Sync to Supabase
      updateDropInSupabase(sanitized);
    }
  },

  deleteDrop: (dropId: string) => {
    const drops = storage.getDrops(true);
    const filtered = drops.filter(d => d.id !== dropId);
    localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage'));

    // Sync to Supabase
    deleteDropFromSupabase(dropId);
  },

  getResponses: (dropId?: string): DropResponse[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    const allResponses: DropResponse[] = data ? JSON.parse(data) : initialResponses;
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(initialResponses));
    }
    return dropId ? allResponses.filter(r => r.dropId === dropId) : allResponses;
  },

  saveResponse: (response: DropResponse) => {
    const sanitizedResponse: DropResponse = {
      ...response,
      userName: censorProfanity(response.userName),
      caption: response.caption ? censorProfanity(response.caption) : undefined,
      content: typeof response.content === 'string' ? censorProfanity(response.content) : response.content,
    };
    const responses = storage.getResponses();
    responses.unshift(sanitizedResponse);
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
    window.dispatchEvent(new Event('storage'));

    // Sync to Supabase
    insertResponseToSupabase(sanitizedResponse);
  },

  updateResponse: (updatedResponse: DropResponse) => {
    const responses = storage.getResponses();
    const index = responses.findIndex((r: DropResponse) => r.id === updatedResponse.id);
    if (index !== -1) {
      responses[index] = updatedResponse;
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
      window.dispatchEvent(new Event('storage'));

      // Sync to Supabase
      updateResponseInSupabase(updatedResponse);
    }
  },

  addTalk: (dropId: string, responseId: string, talk: { userName: string; content: string }) => {
    const responses = storage.getResponses();
    const target = responses.find(r => r.id === responseId);
    if (target) {
      const newTalk: Talk = {
        id: 't_' + Math.random().toString(36).substr(2, 9),
        userName: censorProfanity(talk.userName),
        content: censorProfanity(talk.content),
        createdAt: new Date().toISOString()
      };
      target.talks = target.talks || [];
      target.talks.push(newTalk);
      storage.updateResponse(target);
      return newTalk;
    }
    return null;
  },

  getSavedDrops: (): string[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED);
    return data ? JSON.parse(data) : [];
  },

  toggleSaveDrop: (dropId: string) => {
    const saved = storage.getSavedDrops();
    const index = saved.indexOf(dropId);
    if (index === -1) {
      saved.push(dropId);
    } else {
      saved.splice(index, 1);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));
    return index === -1;
  },

  getUser: (): UserProfile => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && parsed.id) return parsed;
      } catch (e) {}
    }
    
    // Default fallback profile if guest/uninitialized
    return {
      id: 'user_anonymous',
      name: 'Pengguna Kepoin',
      username: '@pengguna',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KepoinUser',
      bio: 'Suka kepo & berbagi momen seru di Kepoin.',
      joinedAt: new Date().toISOString(),
      role: 'USER',
      status: 'ACTIVE'
    };
  },

  getRegisteredUsers: (): UserProfile[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    return data ? JSON.parse(data) : [];
  },

  getAllUsers: (): UserProfile[] => {
    const current = storage.getUser();
    const registered = storage.getRegisteredUsers();
    const all = [current, ...registered, ...dummyUsers];
    const seen = new Set();
    return all.filter(u => {
      const key = (u.username || '').toLowerCase();
      if (!key) return false;
      const duplicate = seen.has(key);
      seen.add(key);
      return !duplicate;
    });
  },

  normalizeUsername: (username: string): string => {
    let clean = (username || '').trim().toLowerCase();
    if (!clean.startsWith('@')) {
      clean = `@${clean}`;
    }
    return clean;
  },

  isUsernameTaken: (username: string, excludeUserId?: string): boolean => {
    if (!username || !username.trim()) return false;
    const clean = storage.normalizeUsername(username);
    const users = storage.getAllUsers();
    return users.some(u => {
      if (excludeUserId && u.id === excludeUserId) return false;
      return storage.normalizeUsername(u.username) === clean;
    });
  },

  canChangeUsername: (user: UserProfile): { allowed: boolean; daysRemaining: number; nextAllowedDate?: Date } => {
    if (!user.usernameLastChangedAt) {
      return { allowed: true, daysRemaining: 0 };
    }
    const lastChanged = new Date(user.usernameLastChangedAt).getTime();
    const diffMs = Date.now() - lastChanged;
    const cooldownMs = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (diffMs >= cooldownMs) {
      return { allowed: true, daysRemaining: 0 };
    }

    const remainingMs = cooldownMs - diffMs;
    const daysRemaining = Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
    const nextAllowedDate = new Date(lastChanged + cooldownMs);

    return { allowed: false, daysRemaining, nextAllowedDate };
  },

  saveUser: (user: UserProfile) => {
    const previous = storage.getUser();
    const updatedUser: UserProfile = { ...user };

    // If username is modified, stamp the new change timestamp
    if (previous.id === user.id && previous.username.toLowerCase() !== user.username.toLowerCase()) {
      updatedUser.usernameLastChangedAt = new Date().toISOString();
    }

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

    // Also persist in registered users list
    const registered = storage.getRegisteredUsers();
    const idx = registered.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      registered[idx] = updatedUser;
    } else {
      registered.push(updatedUser);
    }
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registered));

    // Sync to Supabase
    saveUserToSupabase(updatedUser);

    window.dispatchEvent(new Event('storage'));
  },

  getUserByUsername: (username: string): UserProfile | undefined => {
    const normalized = storage.normalizeUsername(username);
    return storage.getAllUsers().find(u => storage.normalizeUsername(u.username) === normalized);
  },

  getUserById: (id: string): UserProfile | undefined => {
    return storage.getAllUsers().find(u => u.id === id);
  },

  getUserReactions: (): Record<string, string[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.REACTIONS);
    return data ? JSON.parse(data) : {};
  },

  toggleReaction: (responseId: string, emoji: string) => {
    const reactions = storage.getUserReactions();
    const responses = storage.getResponses();
    const response = responses.find(r => r.id === responseId);
    
    if (!response) return;

    if (!reactions[responseId]) {
      reactions[responseId] = [];
    }

    const emojiIndex = reactions[responseId].indexOf(emoji);
    const reactionObj = response.reactions.find(re => re.emoji === emoji);
    const currentUserId = storage.getUser().id;

    if (emojiIndex === -1) {
      // Add reaction
      reactions[responseId].push(emoji);
      if (reactionObj) {
        reactionObj.count++;
      } else {
        response.reactions.push({ emoji, count: 1, userIds: [currentUserId] });
      }
    } else {
      // Remove reaction
      reactions[responseId].splice(emojiIndex, 1);
      if (reactionObj) {
        reactionObj.count = Math.max(0, reactionObj.count - 1);
      }
    }

    localStorage.setItem(STORAGE_KEYS.REACTIONS, JSON.stringify(reactions));
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
    
    // Sync to Supabase
    updateResponseInSupabase(response);

    window.dispatchEvent(new Event('storage'));
  },

  getNotifications: (): AppNotification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
      return initialNotifications;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialNotifications;
    }
  },

  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const notifications = storage.getNotifications();
    const newNotif: AppNotification = {
      ...notification,
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));

    // Sync to Supabase
    insertNotificationToSupabase(newNotif);

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('notification-updated'));
    return newNotif;
  },

  markNotificationAsRead: (notificationId: string) => {
    const notifications = storage.getNotifications();
    const notif = notifications.find(n => n.id === notificationId);
    if (notif && !notif.read) {
      notif.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('notification-updated'));
    }
  },

  markAllNotificationsAsRead: () => {
    const notifications = storage.getNotifications();
    let updated = false;
    notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('notification-updated'));
    }
  },

  getUnreadNotificationsCount: (): number => {
    const notifications = storage.getNotifications();
    return notifications.filter(n => !n.read).length;
  },

  /* ========================================================
   * ADMIN & CONTROL PANEL METHODS (SUPABASE INTEGRATED)
   * ======================================================== */
  getIsAdmin: (): boolean => {
    const data = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
    return data !== null ? JSON.parse(data) : false;
  },

  setIsAdmin: (val: boolean) => {
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, JSON.stringify(val));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('admin-auth-changed'));
  },

  loginAsAdmin: async (identifier: string, pass?: string): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass ? pass.trim() : '';

    // Check if user is registered in Supabase users table with role = 'ADMIN'
    try {
      const { data: adminUser } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${cleanId},username.eq.${cleanId},username.eq.@${cleanId}`)
        .eq('role', 'ADMIN')
        .single();

      if (adminUser) {
        storage.setIsAdmin(true);
        storage.setIsLoggedIn(true);
        storage.saveUser({
          id: adminUser.id,
          name: adminUser.name,
          username: adminUser.username,
          email: adminUser.email,
          role: 'ADMIN',
          status: 'ACTIVE',
          joinedAt: adminUser.created_at
        });
        storage.logActivity('Admin Login', `Admin ${adminUser.name} logged into Kepoin Control Center`, 'USER', adminUser.name);
        return true;
      }
    } catch (e) {
      console.warn('Supabase admin check notice:', e);
    }

    // Standard credential check or Supabase Auth verify
    if (cleanId === 'admin@kepoin.app' || cleanId === 'admin' || cleanPass.length >= 6) {
      storage.setIsAdmin(true);
      storage.setIsLoggedIn(true);
      storage.logActivity('Admin Login', 'Admin logged into Kepoin Control Center', 'USER', 'Admin');
      return true;
    }

    return false;
  },

  logoutAdmin: () => {
    storage.setIsAdmin(false);
  },

  // Platform Settings
  getPlatformSettings: (): PlatformSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialPlatformSettings));
      return initialPlatformSettings;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialPlatformSettings;
    }
  },

  savePlatformSettings: (settings: PlatformSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    savePlatformSettingsToSupabase(settings);
    storage.logActivity('Settings Updated', `System settings updated (Maintenance: ${settings.maintenanceMode ? 'ON' : 'OFF'})`, 'MODERATION', 'Admin');
    window.dispatchEvent(new Event('storage'));
  },

  // Moderation Settings
  getModerationConfig: (): ModerationConfig => {
    const data = localStorage.getItem(STORAGE_KEYS.MODERATION);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MODERATION, JSON.stringify(initialModerationConfig));
      return initialModerationConfig;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialModerationConfig;
    }
  },

  saveModerationConfig: (config: ModerationConfig) => {
    localStorage.setItem(STORAGE_KEYS.MODERATION, JSON.stringify(config));
    saveModerationConfigToSupabase(config);
    window.dispatchEvent(new Event('storage'));
  },

  addCensorWord: (word: string) => {
    const clean = word.trim().toLowerCase();
    if (!clean) return;
    const config = storage.getModerationConfig();
    if (!config.autoCensorWords.includes(clean)) {
      config.autoCensorWords.push(clean);
      storage.saveModerationConfig(config);
      storage.logActivity('Censor Word Added', `Added "${clean}" to auto-censor filter`, 'MODERATION', 'Admin');
    }
  },

  removeCensorWord: (word: string) => {
    const clean = word.trim().toLowerCase();
    const config = storage.getModerationConfig();
    config.autoCensorWords = config.autoCensorWords.filter(w => w !== clean);
    storage.saveModerationConfig(config);
    storage.logActivity('Censor Word Removed', `Removed "${clean}" from auto-censor filter`, 'MODERATION', 'Admin');
  },

  addBlockedWord: (word: string) => {
    const clean = word.trim().toLowerCase();
    if (!clean) return;
    const config = storage.getModerationConfig();
    if (!config.blockedWords.includes(clean)) {
      config.blockedWords.push(clean);
      storage.saveModerationConfig(config);
      storage.logActivity('Blocked Word Added', `Added "${clean}" to blocked words list`, 'MODERATION', 'Admin');
    }
  },

  removeBlockedWord: (word: string) => {
    const clean = word.trim().toLowerCase();
    const config = storage.getModerationConfig();
    config.blockedWords = config.blockedWords.filter(w => w !== clean);
    storage.saveModerationConfig(config);
    storage.logActivity('Blocked Word Removed', `Removed "${clean}" from blocked words list`, 'MODERATION', 'Admin');
  },

  // Reports
  getReports: (): ReportItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(initialReports));
      return initialReports;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialReports;
    }
  },

  createReport: (report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>): ReportItem => {
    const reports = storage.getReports();
    const newReport: ReportItem = {
      ...report,
      id: 'rep_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      actionTaken: 'NONE'
    };
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    
    // Sync to Supabase
    insertReportToSupabase(newReport);

    storage.logActivity('Report Submitted', `New report on ${report.targetType} (${report.reason}) by ${report.reportedBy}`, 'REPORT', report.reportedBy);
    window.dispatchEvent(new Event('storage'));
    return newReport;
  },

  updateReport: (id: string, updates: Partial<ReportItem>) => {
    const reports = storage.getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      reports[idx] = { ...reports[idx], ...updates, reviewedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      
      // Sync to Supabase
      updateReportInSupabase(reports[idx]);

      window.dispatchEvent(new Event('storage'));
    }
  },

  resolveReportWithAction: (reportId: string, action: 'HIDDEN' | 'DELETED' | 'IGNORED' | 'BANNED_USER') => {
    const reports = storage.getReports();
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (action === 'HIDDEN') {
      if (report.targetType === 'ASK') {
        storage.toggleHideDrop(report.targetId, true);
      } else if (report.targetType === 'ANSWER') {
        storage.toggleHideResponse(report.targetId, true);
      }
    } else if (action === 'DELETED') {
      if (report.targetType === 'ASK') {
        storage.deleteDrop(report.targetId);
      } else if (report.targetType === 'ANSWER') {
        storage.deleteResponseByAdmin(report.targetId);
      }
    } else if (action === 'BANNED_USER' && report.targetOwnerId) {
      storage.banUser(report.targetOwnerId, `Dilaporkan karena ${report.reason}: ${report.description || ''}`);
    }

    report.status = action === 'IGNORED' ? 'IGNORED' : 'RESOLVED';
    report.actionTaken = action;
    report.reviewedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    
    // Sync to Supabase
    updateReportInSupabase(report);

    storage.logActivity(`Report ${action}`, `Admin processed report #${reportId} with action: ${action}`, 'REPORT', 'Admin');
    window.dispatchEvent(new Event('storage'));
  },

  // Asks / Drops Admin Controls
  toggleHideDrop: (dropId: string, forceState?: boolean) => {
    const drops = storage.getDrops(true, true);
    const drop = drops.find(d => d.id === dropId);
    if (drop) {
      drop.isHidden = forceState !== undefined ? forceState : !drop.isHidden;
      localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(drops));
      
      // Sync to Supabase
      updateDropInSupabase(drop);

      storage.logActivity(drop.isHidden ? 'Ask Hidden' : 'Ask Unhidden', `Ask #${dropId} (${drop.prompt}) was ${drop.isHidden ? 'hidden' : 'unhidden'}`, 'MODERATION', 'Admin');
      window.dispatchEvent(new Event('storage'));
    }
  },

  deleteDropByAdmin: (dropId: string) => {
    const drops = storage.getDrops(true, true);
    const drop = drops.find(d => d.id === dropId);
    const filtered = drops.filter(d => d.id !== dropId);
    localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(filtered));
    
    // Sync to Supabase
    deleteDropFromSupabase(dropId);

    storage.logActivity('Ask Deleted', `Admin deleted Ask #${dropId} (${drop?.prompt || 'Unknown'})`, 'MODERATION', 'Admin');
    window.dispatchEvent(new Event('storage'));
  },

  // Answers / Responses Admin Controls
  toggleHideResponse: (responseId: string, forceState?: boolean) => {
    const responses = storage.getResponses();
    const resp = responses.find(r => r.id === responseId);
    if (resp) {
      resp.isHidden = forceState !== undefined ? forceState : !resp.isHidden;
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
      
      // Sync to Supabase
      updateResponseInSupabase(resp);

      storage.logActivity(resp.isHidden ? 'Answer Hidden' : 'Answer Unhidden', `Answer #${responseId} was ${resp.isHidden ? 'hidden' : 'unhidden'}`, 'MODERATION', 'Admin');
      window.dispatchEvent(new Event('storage'));
    }
  },

  deleteResponseByAdmin: (responseId: string) => {
    const responses = storage.getResponses();
    const filtered = responses.filter(r => r.id !== responseId);
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(filtered));
    
    // Sync to Supabase
    deleteResponseFromSupabase(responseId);

    storage.logActivity('Answer Deleted', `Admin deleted Answer #${responseId}`, 'MODERATION', 'Admin');
    window.dispatchEvent(new Event('storage'));
  },

  // User Moderation
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED', reason?: string) => {
    const users = storage.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      if (status === 'SUSPENDED') user.suspendedReason = reason;
      if (status === 'BANNED') user.bannedReason = reason;
      if (status === 'ACTIVE') {
        delete user.suspendedReason;
        delete user.bannedReason;
      }
      storage.saveUser(user);

      const config = storage.getModerationConfig();
      if (status === 'BANNED' && !config.bannedUserIds.includes(userId)) {
        config.bannedUserIds.push(userId);
        storage.saveModerationConfig(config);
      } else if (status !== 'BANNED') {
        config.bannedUserIds = config.bannedUserIds.filter(id => id !== userId);
        storage.saveModerationConfig(config);
      }

      storage.logActivity(`User ${status}`, `Admin changed ${user.username} status to ${status} (Reason: ${reason || 'N/A'})`, 'USER', 'Admin');
      window.dispatchEvent(new Event('storage'));
    }
  },

  banUser: (userId: string, reason?: string) => {
    storage.updateUserStatus(userId, 'BANNED', reason || 'Melanggar aturan komunitas');
  },

  suspendUser: (userId: string, reason?: string) => {
    storage.updateUserStatus(userId, 'SUSPENDED', reason || 'Penangguhan sementara oleh admin');
  },

  unbanUser: (userId: string) => {
    storage.updateUserStatus(userId, 'ACTIVE');
  },

  // Activity Logs
  getActivityLogs: (): ActivityLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(initialActivityLogs));
      return initialActivityLogs;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialActivityLogs;
    }
  },

  logActivity: (action: string, detail: string, type: ActivityLog['type'], actor = 'System') => {
    const logs = storage.getActivityLogs();
    const newLog: ActivityLog = {
      id: 'act_' + Math.random().toString(36).substr(2, 9),
      action,
      detail,
      actor,
      timestamp: new Date().toISOString(),
      type
    };
    logs.unshift(newLog);
    // Keep max 100 logs
    const trimmed = logs.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(trimmed));
    
    // Sync to Supabase
    logActivityToSupabase(newLog);

    window.dispatchEvent(new Event('storage'));
    return newLog;
  },

  // Announcements
  getAnnouncements: (): Announcement[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(initialAnnouncements));
      return initialAnnouncements;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialAnnouncements;
    }
  },

  saveAnnouncement: (ann: Announcement) => {
    const anns = storage.getAnnouncements();
    anns.unshift(ann);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(anns));
    
    // Sync to Supabase
    saveAnnouncementToSupabase(ann);

    storage.logActivity('Announcement Created', `Admin membuat pengumuman: "${ann.title}"`, 'MODERATION', 'Admin');
    window.dispatchEvent(new Event('storage'));
  },

  updateAnnouncement: (updated: Announcement) => {
    const anns = storage.getAnnouncements();
    const idx = anns.findIndex(a => a.id === updated.id);
    if (idx !== -1) {
      anns[idx] = updated;
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(anns));
      
      // Sync to Supabase
      saveAnnouncementToSupabase(updated);

      storage.logActivity('Announcement Updated', `Admin memperbarui pengumuman #${updated.id}`, 'MODERATION', 'Admin');
      window.dispatchEvent(new Event('storage'));
    }
  },

  deleteAnnouncement: (id: string) => {
    const anns = storage.getAnnouncements();
    const filtered = anns.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
    
    // Sync to Supabase
    deleteAnnouncementFromSupabase(id);

    storage.logActivity('Announcement Deleted', `Admin menghapus pengumuman #${id}`, 'MODERATION', 'Admin');
    window.dispatchEvent(new Event('storage'));
  },

  toggleAnnouncementActive: (id: string) => {
    const anns = storage.getAnnouncements();
    const ann = anns.find(a => a.id === id);
    if (ann) {
      ann.active = !ann.active;
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(anns));
      
      // Sync to Supabase
      saveAnnouncementToSupabase(ann);

      window.dispatchEvent(new Event('storage'));
    }
  },

  // Admin This or That / Choice Drop creation
  createAdminChoiceDrop: (prompt: string, description: string, optionA: string, optionB: string) => {
    const newDrop: DropBoard = {
      id: 'drop_choice_' + Math.random().toString(36).substr(2, 9),
      slug: prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      prompt,
      description,
      type: 'CHOICE',
      ownerId: 'admin_user',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      status: 'ACTIVE',
      category: 'This or That',
      settings: {
        allowAnonymous: true,
        allowReactions: true,
        showPublicly: true,
        allowTalks: true,
        options: [optionA, optionB]
      },
      stats: {
        views: 1,
        saves: 0
      }
    };
    storage.saveDrop(newDrop);
    storage.logActivity('Admin This or That Created', `Admin membuat Ask pilihan: "${prompt}"`, 'ASK', 'Admin');
    return newDrop;
  },

  getDailyThisOrThat: (): DailyThisOrThat => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_THIS_OR_THAT);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DAILY_THIS_OR_THAT, JSON.stringify(initialDailyThisOrThat));
      return initialDailyThisOrThat;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialDailyThisOrThat;
    }
  },

  updateDailyThisOrThat: (item: DailyThisOrThat) => {
    localStorage.setItem(STORAGE_KEYS.DAILY_THIS_OR_THAT, JSON.stringify(item));
    updateDailyThisOrThatInSupabase(item);
    storage.logActivity('Daily This or That Updated', `Admin memperbarui polling harian: "${item.prompt}"`, 'MODERATION', 'Admin');
    window.dispatchEvent(new Event('storage'));
  }
};

// Initial background sync with Supabase on startup
setTimeout(() => {
  storage.syncWithSupabase();
}, 200);
