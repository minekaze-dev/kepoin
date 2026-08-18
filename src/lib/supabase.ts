/// <reference types="vite/client" />
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { 
  DropBoard, 
  DropResponse, 
  UserProfile, 
  ReportItem, 
  ModerationConfig, 
  PlatformSettings, 
  ActivityLog, 
  Announcement, 
  DailyThisOrThat,
  AppNotification
} from '../types';

export const SUPABASE_URL = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://iugdyjtohhimtqwmyqxn.supabase.co';

export const SUPABASE_ANON_KEY = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2R5anRvaGhpbXRxd215cXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDg5OTcsImV4cCI6MjEwMjQ4NDk5N30.R0ikin1otrUTKKeR2tNbjXUwJtyPdqRTFlYZkygJ9QM';


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/* =========================================================================
 * SUPABASE REALTIME & DATABASE HELPER SERVICES
 * ========================================================================= */

// Test Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('drops').select('id').limit(1);
    if (error) {
      console.warn('Supabase query notice (tables may need SQL migration):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase connection check warning:', err);
    return false;
  }
}

// --------------------------------------------------------------------------
// 1. DROPS / ASKS
// --------------------------------------------------------------------------
export async function fetchDropsFromSupabase(): Promise<DropBoard[] | null> {
  try {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Could not fetch drops from Supabase, falling back to cache:', error?.message);
      return null;
    }

    return data.map((row: any): DropBoard => ({
      id: row.id,
      slug: row.slug,
      prompt: row.prompt,
      description: row.description || undefined,
      coverImage: row.cover_image || undefined,
      type: row.type,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      status: row.status,
      location: row.location || undefined,
      category: row.category || undefined,
      isHidden: !!row.is_hidden,
      isGuest: !!row.is_guest,
      settings: row.settings || {
        allowAnonymous: true,
        allowReactions: true,
        showPublicly: true,
        allowTalks: true,
      },
      stats: row.stats || { views: 0, saves: 0 },
      reactions: row.reactions || [],
      talks: row.talks || [],
    }));
  } catch (e) {
    console.error('Error fetching drops from Supabase:', e);
    return null;
  }
}

// Helper to ensure user exists in Supabase before foreign key insertion
async function ensureUserExistsInSupabase(userId: string, name = 'Pengguna Kepoin', username = '@user') {
  if (!userId) return;
  try {
    const { data } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
    if (!data) {
      await supabase.from('users').upsert({
        id: userId,
        name: name,
        username: username.startsWith('@') ? username : `@${username.replace(/[^a-zA-Z0-9_]/g, '')}`,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('ensureUserExistsInSupabase warning:', err);
  }
}

export async function insertDropToSupabase(drop: DropBoard): Promise<boolean> {
  try {
    await ensureUserExistsInSupabase(drop.ownerId, 'Pengguna Kepoin', 'user_' + (drop.ownerId || 'anon').slice(-6));

    const { error } = await supabase.from('drops').upsert({
      id: drop.id,
      slug: drop.slug,
      prompt: drop.prompt,
      description: drop.description || null,
      cover_image: drop.coverImage || null,
      type: drop.type,
      owner_id: drop.ownerId,
      created_at: drop.createdAt,
      expires_at: drop.expiresAt,
      status: drop.status,
      location: drop.location || null,
      category: drop.category || null,
      is_hidden: !!drop.isHidden,
      is_guest: !!drop.isGuest,
      settings: drop.settings,
      stats: drop.stats,
      reactions: drop.reactions || [],
      talks: drop.talks || [],
    });
    if (error) {
      console.warn('Error saving drop to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving drop:', err);
    return false;
  }
}

export async function updateDropInSupabase(drop: DropBoard): Promise<boolean> {
  return insertDropToSupabase(drop);
}

export async function deleteDropFromSupabase(dropId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('drops').delete().eq('id', dropId);
    if (error) {
      console.warn('Error deleting drop from Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error deleting drop:', err);
    return false;
  }
}

// Auto-cleanup expired drops in Supabase
export async function cleanupExpiredDropsInSupabase(): Promise<void> {
  try {
    const nowIso = new Date().toISOString();
    
    // Mark status EXPIRED for all drops past their expiration time
    await supabase
      .from('drops')
      .update({ status: 'EXPIRED' })
      .eq('status', 'ACTIVE')
      .lt('expires_at', nowIso);

    // Automatically delete expired guest drops past their deadline
    await supabase
      .from('drops')
      .delete()
      .eq('is_guest', true)
      .lt('expires_at', nowIso);
  } catch (err) {
    console.warn('Auto-cleanup expired drops warning:', err);
  }
}

// --------------------------------------------------------------------------
// 2. DROP RESPONSES & TALKS
// --------------------------------------------------------------------------
export async function fetchResponsesFromSupabase(): Promise<DropResponse[] | null> {
  try {
    const { data, error } = await supabase
      .from('drop_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return null;
    }

    return data.map((row: any): DropResponse => ({
      id: row.id,
      dropId: row.drop_id,
      userName: row.user_name,
      userId: row.user_id || undefined,
      isAnonymous: !!row.is_anonymous,
      content: row.content,
      caption: row.caption || undefined,
      createdAt: row.created_at,
      reactions: row.reactions || [],
      talks: row.talks || [],
      isHidden: !!row.is_hidden,
    }));
  } catch (e) {
    console.error('Error fetching responses from Supabase:', e);
    return null;
  }
}

export async function insertResponseToSupabase(resp: DropResponse): Promise<boolean> {
  try {
    if (resp.userId) {
      await ensureUserExistsInSupabase(resp.userId, resp.userName, 'user_' + resp.userId.slice(-6));
    }

    const { error } = await supabase.from('drop_responses').upsert({
      id: resp.id,
      drop_id: resp.dropId,
      user_name: resp.userName,
      user_id: resp.userId || null,
      is_anonymous: !!resp.isAnonymous,
      content: resp.content,
      caption: resp.caption || null,
      created_at: resp.createdAt,
      reactions: resp.reactions || [],
      talks: resp.talks || [],
      is_hidden: !!resp.isHidden,
    });
    if (error) {
      console.warn('Error saving response to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving response:', err);
    return false;
  }
}

export async function updateResponseInSupabase(resp: DropResponse): Promise<boolean> {
  return insertResponseToSupabase(resp);
}

export async function deleteResponseFromSupabase(responseId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('drop_responses').delete().eq('id', responseId);
    if (error) {
      console.warn('Error deleting response from Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error deleting response:', err);
    return false;
  }
}

// --------------------------------------------------------------------------
// 3. REPORTS
// --------------------------------------------------------------------------
export async function fetchReportsFromSupabase(): Promise<ReportItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any): ReportItem => ({
      id: row.id,
      targetType: row.target_type,
      targetId: row.target_id,
      targetTitle: row.target_title || undefined,
      targetContent: row.target_content || undefined,
      targetOwnerName: row.target_owner_name || undefined,
      targetOwnerUsername: row.target_owner_username || undefined,
      targetOwnerId: row.target_owner_id || undefined,
      reportedBy: row.reported_by,
      reporterId: row.reporter_id || undefined,
      reason: row.reason,
      description: row.description || undefined,
      createdAt: row.created_at,
      status: row.status,
      actionTaken: row.action_taken || 'NONE',
      reviewedAt: row.reviewed_at || undefined,
    }));
  } catch (e) {
    console.error('Error fetching reports from Supabase:', e);
    return null;
  }
}

export async function insertReportToSupabase(rep: ReportItem): Promise<boolean> {
  try {
    const { error } = await supabase.from('reports').upsert({
      id: rep.id,
      target_type: rep.targetType,
      target_id: rep.targetId,
      target_title: rep.targetTitle || null,
      target_content: rep.targetContent || null,
      target_owner_name: rep.targetOwnerName || null,
      target_owner_username: rep.targetOwnerUsername || null,
      target_owner_id: rep.targetOwnerId || null,
      reported_by: rep.reportedBy,
      reporter_id: rep.reporterId || null,
      reason: rep.reason,
      description: rep.description || null,
      created_at: rep.createdAt,
      status: rep.status,
      action_taken: rep.actionTaken || 'NONE',
      reviewed_at: rep.reviewedAt || null,
    });
    if (error) {
      console.warn('Error saving report to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving report:', err);
    return false;
  }
}

export async function updateReportInSupabase(rep: ReportItem): Promise<boolean> {
  return insertReportToSupabase(rep);
}

// --------------------------------------------------------------------------
// 4. PLATFORM SETTINGS & MODERATION
// --------------------------------------------------------------------------
export async function fetchPlatformSettingsFromSupabase(): Promise<PlatformSettings | null> {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) return null;

    return {
      platformName: data.platform_name || 'Kepoin',
      maintenanceMode: !!data.maintenance_mode,
      maintenanceMessage: data.maintenance_message || 'Kepoin sedang dalam perbaikan rutin.',
      defaultExpirationDays: data.default_expiration_days || 3,
      maxResponsesPerDrop: data.max_responses_per_drop || 500,
      allowAnonymousGlobal: data.allow_anonymous_global !== false,
      allowPublicRegistration: data.allow_public_registration !== false,
    };
  } catch (e) {
    return null;
  }
}

export async function savePlatformSettingsToSupabase(settings: PlatformSettings): Promise<boolean> {
  try {
    const { error } = await supabase.from('platform_settings').upsert({
      id: 'default',
      platform_name: settings.platformName,
      maintenance_mode: settings.maintenanceMode,
      maintenance_message: settings.maintenanceMessage,
      default_expiration_days: settings.defaultExpirationDays,
      max_responses_per_drop: settings.maxResponsesPerDrop,
      allow_anonymous_global: settings.allowAnonymousGlobal,
      allow_public_registration: settings.allowPublicRegistration,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function fetchModerationConfigFromSupabase(): Promise<ModerationConfig | null> {
  try {
    const { data, error } = await supabase
      .from('moderation_config')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) return null;

    return {
      autoCensorWords: data.auto_censor_words || [],
      blockedWords: data.blocked_words || [],
      spamDetectionEnabled: data.spam_detection_enabled !== false,
      spamThresholdPerMinute: data.spam_threshold_per_minute || 5,
      bannedUserIds: data.banned_user_ids || [],
    };
  } catch (e) {
    return null;
  }
}

export async function saveModerationConfigToSupabase(config: ModerationConfig): Promise<boolean> {
  try {
    const { error } = await supabase.from('moderation_config').upsert({
      id: 'default',
      auto_censor_words: config.autoCensorWords,
      blocked_words: config.blockedWords,
      spam_detection_enabled: config.spamDetectionEnabled,
      spam_threshold_per_minute: config.spamThresholdPerMinute,
      banned_user_ids: config.bannedUserIds,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    return false;
  }
}

// --------------------------------------------------------------------------
// 5. ANNOUNCEMENTS
// --------------------------------------------------------------------------
export async function fetchAnnouncementsFromSupabase(): Promise<Announcement[] | null> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any): Announcement => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      createdAt: row.created_at,
      active: !!row.is_active,
      adminName: row.admin_name || 'Admin Kepoin',
    }));
  } catch (e) {
    return null;
  }
}

export async function saveAnnouncementToSupabase(ann: Announcement): Promise<boolean> {
  try {
    const { error } = await supabase.from('announcements').upsert({
      id: ann.id,
      title: ann.title,
      content: ann.content,
      category: ann.category,
      is_active: ann.active,
      admin_name: ann.adminName,
      created_at: ann.createdAt,
    });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteAnnouncementFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    return !error;
  } catch (err) {
    return false;
  }
}

// --------------------------------------------------------------------------
// 6. ACTIVITY LOGS
// --------------------------------------------------------------------------
export async function fetchActivityLogsFromSupabase(): Promise<ActivityLog[] | null> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return null;

    return data.map((row: any): ActivityLog => ({
      id: row.id,
      action: row.action,
      detail: row.detail,
      actor: row.actor,
      timestamp: row.created_at,
      type: row.type,
    }));
  } catch (e) {
    return null;
  }
}

export async function logActivityToSupabase(log: ActivityLog): Promise<boolean> {
  try {
    const { error } = await supabase.from('activity_logs').insert({
      id: log.id,
      action: log.action,
      detail: log.detail,
      actor: log.actor,
      type: log.type,
      created_at: log.timestamp,
    });
    return !error;
  } catch (err) {
    return false;
  }
}

// --------------------------------------------------------------------------
// 7. DAILY THIS OR THAT
// --------------------------------------------------------------------------
export async function fetchDailyThisOrThatFromSupabase(): Promise<DailyThisOrThat | null> {
  try {
    const { data, error } = await supabase
      .from('daily_this_or_that')
      .select('*')
      .eq('id', 'daily_default_1')
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      prompt: data.prompt,
      optionA: data.option_a,
      optionB: data.option_b,
      votesA: data.votes_a || 0,
      votesB: data.votes_b || 0,
      votedUserIds: data.voted_user_ids || [],
      updatedAt: data.updated_at,
    };
  } catch (e) {
    return null;
  }
}

export async function updateDailyThisOrThatInSupabase(item: DailyThisOrThat): Promise<boolean> {
  try {
    const { error } = await supabase.from('daily_this_or_that').upsert({
      id: item.id || 'daily_default_1',
      prompt: item.prompt,
      option_a: item.optionA,
      option_b: item.optionB,
      votes_a: item.votesA || 0,
      votes_b: item.votesB || 0,
      voted_user_ids: item.votedUserIds || [],
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    return false;
  }
}

// --------------------------------------------------------------------------
// 8. USERS (Profiles & Admin)
// --------------------------------------------------------------------------
export async function fetchUsersFromSupabase(): Promise<UserProfile[] | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any): UserProfile => ({
      id: row.id,
      name: row.name,
      username: row.username,
      avatar: row.avatar || undefined,
      bio: row.bio || undefined,
      location: row.location || undefined,
      isPrivate: !!row.is_private,
      joinedAt: row.created_at,
      usernameLastChangedAt: row.username_last_changed_at || undefined,
      status: row.status || 'ACTIVE',
      suspendedReason: row.suspended_reason || undefined,
      bannedReason: row.banned_reason || undefined,
      role: row.role || 'USER',
    }));
  } catch (e) {
    return null;
  }
}

export async function saveUserToSupabase(user: UserProfile): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar || null,
      bio: user.bio || null,
      location: user.location || null,
      is_private: !!user.isPrivate,
      role: user.role || 'USER',
      status: user.status || 'ACTIVE',
      suspended_reason: user.suspendedReason || null,
      banned_reason: user.bannedReason || null,
      username_last_changed_at: user.usernameLastChangedAt || null,
      created_at: user.joinedAt || new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteUserFromSupabase(userId: string): Promise<boolean> {
  try {
    // Delete user profile
    const { error: userError } = await supabase.from('users').delete().eq('id', userId);
    
    // Also delete their drops and responses to prevent orphan data
    await supabase.from('drops').delete().eq('owner_id', userId);
    await supabase.from('drop_responses').delete().eq('user_id', userId);
    await supabase.from('notifications').delete().eq('user_id', userId);

    return !userError;
  } catch (err) {
    console.error('Error deleting user from Supabase:', err);
    return false;
  }
}

// --------------------------------------------------------------------------
// 9. NOTIFICATIONS
// --------------------------------------------------------------------------
export async function fetchNotificationsFromSupabase(userId: string): Promise<AppNotification[] | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any): AppNotification => ({
      id: row.id,
      userId: row.user_id,
      actorName: row.actor_name,
      actorAvatar: row.actor_avatar || undefined,
      type: row.type,
      message: row.message,
      dropId: row.drop_id || '',
      dropSlug: row.drop_slug || '',
      dropPrompt: row.drop_prompt || '',
      linkUrl: row.link_url || '',
      read: !!row.is_read,
      createdAt: row.created_at,
    }));
  } catch (e) {
    return null;
  }
}

export async function insertNotificationToSupabase(notif: AppNotification): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').insert({
      id: notif.id,
      user_id: notif.userId,
      actor_name: notif.actorName,
      actor_avatar: notif.actorAvatar || null,
      type: notif.type,
      message: notif.message,
      drop_id: notif.dropId,
      drop_slug: notif.dropSlug,
      drop_prompt: notif.dropPrompt,
      link_url: notif.linkUrl,
      is_read: notif.read,
      created_at: notif.createdAt,
    });
    return !error;
  } catch (err) {
    return false;
  }
}
