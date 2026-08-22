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
  deleteUserFromSupabase,
  fetchNotificationsFromSupabase,
  insertNotificationToSupabase
} from './supabase';

const STORAGE_KEYS = {
  DROPS: 'dropboard_drops_v5',
  RESPONSES: 'dropboard_responses_v6',
  SAVED: 'dropboard_saved',
  USER: 'dropboard_user',
  REACTIONS: 'dropboard_user_reactions',
  DROP_REACTIONS: 'dropboard_drop_reactions',
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
      // Helper to merge arrays by ID
      const mergeById = (local: any[], remote: any[]) => {
        const remoteIds = new Set(remote.map(i => i.id));
        const onlyLocal = local.filter(i => !remoteIds.has(i.id));
        return [...remote, ...onlyLocal];
      };

      // 1. Drops
      const remoteDrops = await fetchDropsFromSupabase();
      if (remoteDrops) {
        const localDrops = storage.getDrops(true, true);
        const mergedDrops = mergeById(localDrops, remoteDrops);
        localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(mergedDrops));
        
        // Push any local-only drops to Supabase
        const remoteIds = new Set(remoteDrops.map(d => d.id));
        for (const drop of localDrops) {
          if (!remoteIds.has(drop.id)) {
            await insertDropToSupabase(drop);
          }
        }
      }

      // 2. Responses
      const remoteResponses = await fetchResponsesFromSupabase();
      if (remoteResponses) {
        const localResponses = storage.getResponses();
        const mergedResponses = mergeById(localResponses, remoteResponses);
        localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(mergedResponses));

        // Push any local-only responses to Supabase
        const remoteIds = new Set(remoteResponses.map(r => r.id));
        for (const resp of localResponses) {
          if (!remoteIds.has(resp.id)) {
            await insertResponseToSupabase(resp);
          }
        }
      }

      // 3. Reports
      const remoteReports = await fetchReportsFromSupabase();
      if (remoteReports) {
        const localReports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
        const mergedReports = mergeById(localReports, remoteReports);
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(mergedReports));
      }

      // 4. Platform Settings (Remote wins)
      const settings = await fetchPlatformSettingsFromSupabase();
      if (settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      }

      // 5. Moderation Config (Remote wins)
      const modConfig = await fetchModerationConfigFromSupabase();
      if (modConfig) {
        localStorage.setItem(STORAGE_KEYS.MODERATION, JSON.stringify(modConfig));
      }

      // 6. Announcements
      const announcements = await fetchAnnouncementsFromSupabase();
      if (announcements) {
        const localAnn = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || '[]');
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(mergeById(localAnn, announcements)));
      }

      // 7. Activity Logs
      const logs = await fetchActivityLogsFromSupabase();
      if (logs) {
        const localLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]');
        localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(mergeById(localLogs, logs)));
      }

      // 8. Daily This or That
      const daily = await fetchDailyThisOrThatFromSupabase();
      if (daily) {
        localStorage.setItem(STORAGE_KEYS.DAILY_THIS_OR_THAT, JSON.stringify(daily));
      }

      // 9. Users
      const users = await fetchUsersFromSupabase();
      if (users) {
        const localUsers = storage.getRegisteredUsers();
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(mergeById(localUsers, users)));
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

  getDropReactions: (): Record<string, string[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.DROP_REACTIONS);
    return data ? JSON.parse(data) : {};
  },

  isDropExpired: (drop: DropBoard): boolean => {
    if (drop.status === 'EXPIRED' || drop.status === 'CLOSED') return true;
    if (drop.expiresAt && new Date(drop.expiresAt).getTime() <= Date.now()) return true;
    return false;
  },

  toggleReaction: (responseId: string, emoji: string) => {
    if (!storage.getIsLoggedIn()) {
      window.dispatchEvent(new Event('open-login-modal'));
      return;
    }
    const reactions = storage.getUserReactions();
    const responses = storage.getResponses();
    const response = responses.find(r => r.id === responseId);
    
    if (!response) return;

    // Rule 9: disallow new reactions if drop is expired
    const allDrops = storage.getDrops(true);
    const drop = allDrops.find(d => d.id === response.dropId);
    if (drop && storage.isDropExpired(drop)) return;

    if (!reactions[responseId]) {
      reactions[responseId] = [];
    }

    const emojiIndex = reactions[responseId].indexOf(emoji);
    let reactionObj = response.reactions.find(re => re.emoji === emoji);
    const currentUserId = storage.getUser().id;

    if (emojiIndex === -1) {
      // Add reaction
      reactions[responseId].push(emoji);
        if (reactionObj) {
          reactionObj.count++;
          if (!reactionObj.userIds || !reactionObj.userIds.includes(currentUserId)) {
            reactionObj.userIds = [...(reactionObj.userIds || []), currentUserId];
          }
        } else {
          response.reactions.push({ emoji, count: 1, userIds: [currentUserId] });
        }

      // Rule 4 & 6: Reaction notification on answer
      if (response.userId && drop) {
        const currentUser = storage.getUser();
        storage.addOrGroupReactionNotification({
          recipientUserId: response.userId,
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorAvatar: currentUser.avatar,
          emoji,
          targetType: 'ANSWER',
          dropId: drop.id,
          dropSlug: drop.slug,
          dropPrompt: drop.prompt,
          responseId: response.id
        });
      }
    } else {
      // Remove reaction
      reactions[responseId].splice(emojiIndex, 1);
      if (reactionObj) {
        reactionObj.count = Math.max(0, reactionObj.count - 1);
        reactionObj.userIds = reactionObj.userIds.filter(id => id !== currentUserId);
      }
    }

    localStorage.setItem(STORAGE_KEYS.REACTIONS, JSON.stringify(reactions));
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
    
    // Sync to Supabase
    updateResponseInSupabase(response);

    window.dispatchEvent(new Event('storage'));
  },

  toggleDropReaction: (dropId: string, emoji: string) => {
    if (!storage.getIsLoggedIn()) {
      window.dispatchEvent(new Event('open-login-modal'));
      return;
    }
    const dropReactions = storage.getDropReactions();
    const drops = storage.getDrops(true);
    const drop = drops.find(d => d.id === dropId);
    if (!drop) return;

    // Rule 9: disallow new reactions if drop is expired
    if (storage.isDropExpired(drop)) return;

    const currentUserId = storage.getUser().id;
    if (!dropReactions[dropId]) {
      dropReactions[dropId] = [];
    }

    drop.reactions = drop.reactions || [];
    const userEmojiIndex = dropReactions[dropId].indexOf(emoji);
    let reactionObj = drop.reactions.find(r => r.emoji === emoji);

    if (userEmojiIndex === -1) {
      // Add reaction
      dropReactions[dropId].push(emoji);
      if (reactionObj) {
        reactionObj.count++;
        if (!reactionObj.userIds || !reactionObj.userIds.includes(currentUserId)) {
          reactionObj.userIds = [...(reactionObj.userIds || []), currentUserId];
        }
      } else {
        drop.reactions.push({ emoji, count: 1, userIds: [currentUserId] });
      }

      // Rule 3 & 6: Reaction notification on question
      const currentUser = storage.getUser();
      storage.addOrGroupReactionNotification({
        recipientUserId: drop.ownerId,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorAvatar: currentUser.avatar,
        emoji,
        targetType: 'DROP',
        dropId: drop.id,
        dropSlug: drop.slug,
        dropPrompt: drop.prompt
      });
    } else {
      // Remove reaction
      dropReactions[dropId].splice(userEmojiIndex, 1);
      if (reactionObj) {
        reactionObj.count = Math.max(0, reactionObj.count - 1);
        reactionObj.userIds = reactionObj.userIds.filter(id => id !== currentUserId);
      }
    }

    localStorage.setItem(STORAGE_KEYS.DROP_REACTIONS, JSON.stringify(dropReactions));
    storage.updateDrop(drop);
    window.dispatchEvent(new Event('storage'));
  },

  getAllNotifications: (): AppNotification[] => {
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

  getNotifications: (targetUserId?: string): AppNotification[] => {
    // Rule 16: Guest tidak memiliki notif personal
    if (!storage.getIsLoggedIn()) {
      return [];
    }
    const currentUserId = targetUserId || storage.getUser()?.id;
    if (!currentUserId) return [];

    // Trigger expiration alerts check once per read
    storage.checkAndNotifyExpiringDrops();

    const all = storage.getAllNotifications();
    return all
      .filter(n => n.userId === currentUserId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const currentUserId = storage.getUser()?.id;

    // Rule 7: Jangan notifikasi aksi sendiri (kecuali info sistem / expiration)
    const isSystemInfo = notification.type === 'EXPIRED' || notification.type === 'EXPIRING_1H' || notification.type === 'EXPIRING_12H';
    if (!isSystemInfo && notification.userId === currentUserId) {
      return null;
    }

    // Determine priority if not specified (Rule 15)
    let priority = notification.priority;
    if (!priority) {
      if (notification.type === 'ANSWER' || notification.type === 'TALK' || notification.type === 'MENTION' || notification.type === 'RESPONSE' || notification.type === 'COMMENT') {
        priority = 'HIGH';
      } else if (notification.type === 'REACTION' || notification.type === 'REACTION_DROP' || notification.type === 'REACTION_ANSWER') {
        priority = 'MEDIUM';
      } else {
        priority = 'INFO';
      }
    }

    const allNotifs = storage.getAllNotifications();
    const newNotif: AppNotification = {
      ...notification,
      priority,
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false,
    };

    allNotifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs));

    // Sync to Supabase
    insertNotificationToSupabase(newNotif);

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('notification-updated'));
    return newNotif;
  },

  addOrGroupReactionNotification: ({
    recipientUserId,
    actorId,
    actorName,
    actorAvatar,
    isAnonymous,
    emoji,
    targetType,
    dropId,
    dropSlug,
    dropPrompt,
    responseId
  }: {
    recipientUserId: string;
    actorId?: string;
    actorName: string;
    actorAvatar?: string;
    isAnonymous?: boolean;
    emoji: string;
    targetType: 'DROP' | 'ANSWER';
    dropId: string;
    dropSlug: string;
    dropPrompt: string;
    responseId?: string;
  }) => {
    // Rule 3, 4, 7: Do not notify if reacting to own question or answer
    if (recipientUserId === actorId) {
      return;
    }

    // Rule 9: Check if drop is expired
    const allDrops = storage.getDrops(true);
    const drop = allDrops.find(d => d.id === dropId);
    if (drop && storage.isDropExpired(drop)) {
      return;
    }

    const allNotifs = storage.getAllNotifications();
    const targetTypeName = targetType === 'DROP' ? 'pertanyaanmu' : 'jawabanmu';
    const notifType = targetType === 'DROP' ? 'REACTION_DROP' : 'REACTION_ANSWER';

    // Find if there's an existing unread reaction notification for this target and emoji
    const existing = allNotifs.find(n =>
      n.userId === recipientUserId &&
      !n.read &&
      n.dropId === dropId &&
      (targetType === 'ANSWER' ? n.responseId === responseId : true) &&
      (n.type === notifType || n.type === 'REACTION') &&
      n.emoji === emoji
    );

    if (existing) {
      // Grouping (Rule 6: "Raka dan 3 lainnya memberi ❤️ pada pertanyaanmu.")
      const newCount = (existing.actorCount || 1) + 1;
      existing.actorCount = newCount;
      const initialActor = existing.actorName || (isAnonymous ? 'Seseorang' : actorName);
      existing.message = `${initialActor} dan ${newCount - 1} lainnya memberi ${emoji} pada ${targetTypeName}.`;
      existing.createdAt = new Date().toISOString(); // Move to top
      
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } else {
      // Single person notification
      const displayName = isAnonymous ? 'Seseorang' : actorName;
      const newNotif: AppNotification = {
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        userId: recipientUserId,
        actorName: displayName,
        actorAvatar: isAnonymous ? undefined : actorAvatar,
        type: notifType,
        priority: 'MEDIUM',
        emoji,
        actorCount: 1,
        message: `${displayName} memberi ${emoji} pada ${targetTypeName}.`,
        dropId,
        dropSlug,
        dropPrompt,
        responseId,
        createdAt: new Date().toISOString(),
        read: false,
        linkUrl: targetType === 'DROP' ? `/drop/${dropSlug}` : `/drop/${dropSlug}#response-${responseId}`
      };

      allNotifs.unshift(newNotif);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs));
      insertNotificationToSupabase(newNotif);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('notification-updated'));
    }
  },

  handleMentionsInTalk: ({
    content,
    actorId,
    actorName,
    actorAvatar,
    isAnonymous,
    dropId,
    dropSlug,
    dropPrompt,
    responseId,
  }: {
    content: string;
    actorId: string;
    actorName: string;
    actorAvatar?: string;
    isAnonymous?: boolean;
    dropId: string;
    dropSlug: string;
    dropPrompt: string;
    responseId?: string;
  }) => {
    // Extract @mentions (Rule 5)
    const matches = content.match(/@([a-zA-Z0-9_\.]+)/g);
    if (!matches || matches.length === 0) return;

    const allUsers = storage.getAllUsers();
    const processedUserIds = new Set<string>();

    for (const match of matches) {
      const usernameClean = storage.normalizeUsername(match);
      const targetUser = allUsers.find(u => storage.normalizeUsername(u.username) === usernameClean);

      // Rule 5: User yang disebut mendapat notifikasi. Jangan membuat notif jika user menyebut dirinya sendiri.
      if (targetUser && targetUser.id !== actorId && !processedUserIds.has(targetUser.id)) {
        processedUserIds.add(targetUser.id);
        const displayName = isAnonymous ? 'Seseorang' : actorName;

        storage.addNotification({
          userId: targetUser.id,
          actorName: displayName,
          actorAvatar: isAnonymous ? undefined : actorAvatar,
          type: 'MENTION',
          priority: 'HIGH',
          message: `${displayName} menyebutmu di sebuah obrolan.`,
          dropId,
          dropSlug,
          dropPrompt,
          responseId,
          linkUrl: `/drop/${dropSlug}#talks`
        });
      }
    }
  },

  checkAndNotifyExpiringDrops: () => {
    if (!storage.getIsLoggedIn()) return;
    const currentUser = storage.getUser();
    if (!currentUser?.id) return;

    const allDrops = storage.getDrops(true);
    const userDrops = allDrops.filter(d => d.ownerId === currentUser.id);
    const now = Date.now();

    userDrops.forEach(drop => {
      if (!drop.expiresAt) return;
      const expiresAtMs = new Date(drop.expiresAt).getTime();
      const timeLeft = expiresAtMs - now;

      // 1. Expired case
      if (timeLeft <= 0) {
        if (drop.status !== 'EXPIRED') {
          drop.status = 'EXPIRED';
          storage.updateDrop(drop);
        }
        const key = `notif_exp_done_${drop.id}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, 'true');
          storage.addNotification({
            userId: currentUser.id,
            actorName: 'Kepoin',
            type: 'EXPIRED',
            priority: 'INFO',
            message: 'Pertanyaanmu sudah berakhir.',
            dropId: drop.id,
            dropSlug: drop.slug,
            dropPrompt: drop.prompt,
            linkUrl: `/drop/${drop.slug}`
          });
        }
      }
      // 2. 1 Hour before expiration (<= 1h and > 0)
      else if (timeLeft <= 3600 * 1000) {
        const key = `notif_exp_1h_${drop.id}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, 'true');
          storage.addNotification({
            userId: currentUser.id,
            actorName: 'Kepoin',
            type: 'EXPIRING_1H',
            priority: 'INFO',
            message: 'Pertanyaanmu akan berakhir dalam 1 jam.',
            dropId: drop.id,
            dropSlug: drop.slug,
            dropPrompt: drop.prompt,
            linkUrl: `/drop/${drop.slug}`
          });
        }
      }
      // 3. 12 Hours before expiration (<= 12h and > 1h)
      else if (timeLeft <= 12 * 3600 * 1000) {
        const key = `notif_exp_12h_${drop.id}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, 'true');
          storage.addNotification({
            userId: currentUser.id,
            actorName: 'Kepoin',
            type: 'EXPIRING_12H',
            priority: 'INFO',
            message: 'Pertanyaanmu akan berakhir dalam 12 jam.',
            dropId: drop.id,
            dropSlug: drop.slug,
            dropPrompt: drop.prompt,
            linkUrl: `/drop/${drop.slug}`
          });
        }
      }
    });
  },

  markNotificationAsRead: (notificationId: string) => {
    const allNotifs = storage.getAllNotifications();
    const notif = allNotifs.find(n => n.id === notificationId);
    if (notif && !notif.read) {
      notif.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs));
      
      // Explicitly update Supabase here if needed, or rely on other mechanism
      // Ensure the event is dispatched
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('notification-updated'));
    }
  },

  markAllNotificationsAsRead: () => {
    const currentUserId = storage.getUser()?.id;
    if (!currentUserId) return;
    const allNotifs = storage.getAllNotifications();
    let updated = false;
    allNotifs.forEach(n => {
      if (n.userId === currentUserId && !n.read) {
        n.read = true;
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('notification-updated'));
    }
  },

  getUnreadNotificationsCount: (): number => {
    if (!storage.getIsLoggedIn()) return 0;
    const notifications = storage.getNotifications();
    return notifications.filter(n => !n.read).length;
  },

  /* ========================================================
   * ADMIN & CONTROL PANEL METHODS (SUPABASE INTEGRATED)
   * ======================================================== */
  getIsAdmin: (): boolean => {
    const data = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
    if (data !== null && JSON.parse(data) === true) return true;
    const user = storage.getUser();
    if (user && (user.role === 'ADMIN' || user.username?.toLowerCase() === '@admin' || user.username?.toLowerCase() === 'admin' || user.email?.toLowerCase() === 'admin@kepoin.app')) {
      return true;
    }
    return false;
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
    if (!config.autoCensorWords || !config.autoCensorWords.includes(clean)) {
      config.autoCensorWords = [...(config.autoCensorWords || []), clean];
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
    if (!config.blockedWords || !config.blockedWords.includes(clean)) {
      config.blockedWords = [...(config.blockedWords || []), clean];
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
      if (status === 'BANNED' && (!config.bannedUserIds || !config.bannedUserIds.includes(userId))) {
        config.bannedUserIds = [...(config.bannedUserIds || []), userId];
        storage.saveModerationConfig(config);
      } else if (status !== 'BANNED' && config.bannedUserIds) {
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

  deleteUser: async (userId: string) => {
    const users = storage.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      // 1. Remove from local storage
      const filteredUsers = users.filter(u => u.id !== userId);
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(filteredUsers));
      
      // 2. Remove their drops
      const drops = storage.getDrops(true, true);
      const filteredDrops = drops.filter(d => d.ownerId !== userId);
      localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(filteredDrops));
      
      // 3. Remove their responses
      const responses = storage.getResponses();
      const filteredResponses = responses.filter(r => r.userId !== userId);
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(filteredResponses));

      // 4. Delete from Supabase
      await deleteUserFromSupabase(userId);

      storage.logActivity('User Deleted', `Admin menghapus permanen akun ${user.username} (${user.name})`, 'USER', 'Admin');
      window.dispatchEvent(new Event('storage'));
      return true;
    }
    return false;
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
    const current = storage.getDailyThisOrThat();
    const hasChanged = 
      current.prompt !== item.prompt || 
      current.optionA !== item.optionA || 
      current.optionB !== item.optionB;
    
    const finalItem = hasChanged ? {
      ...item,
      votesA: 0,
      votesB: 0,
      votedUserIds: [],
      updatedAt: new Date().toISOString()
    } : item;

    localStorage.setItem(STORAGE_KEYS.DAILY_THIS_OR_THAT, JSON.stringify(finalItem));
    updateDailyThisOrThatInSupabase(finalItem);
    storage.logActivity('Daily This or That Updated', `Admin memperbarui polling harian: "${finalItem.prompt}"${hasChanged ? ' (Voting direset)' : ''}`, 'MODERATION', 'Admin');
    window.dispatchEvent(new Event('storage'));
  }
};

// Initial background sync with Supabase on startup
setTimeout(() => {
  storage.syncWithSupabase();
}, 200);

// Periodic sync every 2 minutes
setInterval(() => {
  storage.syncWithSupabase();
}, 2 * 60 * 1000);
