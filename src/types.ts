/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ResponseType = 'PHOTO' | 'TEXT' | 'NUMBER' | 'PLACE' | 'SONG' | 'CHOICE';

export interface Talk {
  id: string;
  userName: string;
  content: string;
  createdAt: string;
  userId?: string;
  avatar?: string;
  isAnonymous?: boolean;
}

export interface DropBoard {
  id: string;
  slug: string;
  prompt: string;
  description?: string;
  coverImage?: string;
  type: ResponseType;
  ownerId: string;
  createdAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'CLOSED' | 'EXPIRED';
  location?: string;
  category?: string;
  isHidden?: boolean;
  settings: {
    allowAnonymous: boolean;
    allowReactions: boolean;
    showPublicly: boolean;
    allowTalks: boolean;
    maxResponses?: number;
    options?: string[]; // For CHOICE type
  };
  stats: {
    views: number;
    saves: number;
  };
  isGuest?: boolean;
  reactions?: Reaction[];
  talks?: Talk[];
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface DropResponse {
  id: string;
  dropId: string;
  userName: string;
  userId?: string;
  isAnonymous: boolean;
  content: any; // Dynamic based on type
  caption?: string;
  createdAt: string;
  reactions: Reaction[];
  talks?: Talk[];
  isHidden?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  isPrivate?: boolean;
  joinedAt?: string;
  usernameLastChangedAt?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  suspendedReason?: string;
  bannedReason?: string;
  role?: 'USER' | 'ADMIN';
}

export type ReportTargetType = 'ASK' | 'ANSWER' | 'TALK' | 'USER';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'IGNORED';
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'PROFANITY' | 'INAPPROPRIATE' | 'OTHER';

export interface ReportItem {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  targetContent?: string;
  targetOwnerName?: string;
  targetOwnerUsername?: string;
  targetOwnerId?: string;
  reportedBy: string;
  reporterId?: string;
  reason: ReportReason;
  description?: string;
  createdAt: string;
  status: ReportStatus;
  actionTaken?: 'HIDDEN' | 'DELETED' | 'IGNORED' | 'BANNED_USER' | 'NONE';
  reviewedAt?: string;
}

export interface ModerationConfig {
  autoCensorWords: string[];
  blockedWords: string[];
  spamDetectionEnabled: boolean;
  spamThresholdPerMinute: number;
  bannedUserIds: string[];
}

export interface PlatformSettings {
  platformName: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultExpirationDays: number;
  maxResponsesPerDrop: number;
  allowAnonymousGlobal: boolean;
  allowPublicRegistration: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  detail: string;
  actor: string;
  timestamp: string;
  type: 'USER' | 'ASK' | 'ANSWER' | 'MODERATION' | 'REPORT';
}

export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'INFO';

export type NotificationType = 
  | 'ANSWER' 
  | 'TALK' 
  | 'MENTION' 
  | 'REACTION_DROP' 
  | 'REACTION_ANSWER' 
  | 'EXPIRING_12H' 
  | 'EXPIRING_1H' 
  | 'EXPIRED' 
  | 'RESPONSE' 
  | 'COMMENT' 
  | 'REACTION';

export interface AppNotification {
  id: string;
  userId: string;
  actorName?: string;
  actorAvatar?: string;
  type: NotificationType;
  priority?: NotificationPriority;
  emoji?: string;
  actorCount?: number;
  message: string;
  dropId: string;
  dropSlug: string;
  dropPrompt: string;
  responseId?: string;
  talkId?: string;
  createdAt: string;
  read: boolean;
  linkUrl: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'INFO' | 'UPDATE' | 'EVENT' | 'WARNING';
  createdAt: string;
  active: boolean;
  adminName: string;
}

export interface DailyThisOrThat {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  votesA?: number;
  votesB?: number;
  votedUserIds?: string[];
  updatedAt: string;
  createdAt?: string;
}

