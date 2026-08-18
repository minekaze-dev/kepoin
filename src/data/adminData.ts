/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReportItem, ModerationConfig, PlatformSettings, ActivityLog, Announcement, DailyThisOrThat } from '../types';

export const initialModerationConfig: ModerationConfig = {
  autoCensorWords: [
    'anjing',
    'anjink',
    'anying',
    'bangsat',
    'kontol',
    'goblok',
    'tolol',
    'bego',
    'kampret',
    'pantek',
    'memek',
    'bajingan',
    'itil',
    'ngentot',
    'perek',
    'lonte',
    'asu',
    'tai',
    'babi'
  ],
  blockedWords: [
    'judionline',
    'slotgacor',
    'slot88',
    'zeus88',
    'pragmatic88',
    'bokep',
    'openbo',
    'pinjolyuk',
    'hackakun'
  ],
  spamDetectionEnabled: true,
  spamThresholdPerMinute: 5,
  bannedUserIds: []
};

export const initialPlatformSettings: PlatformSettings = {
  platformName: 'Kepoin',
  maintenanceMode: false,
  maintenanceMessage: 'Kepoin sedang dalam peningkatan sistem rutin. Kami akan segera kembali!',
  defaultExpirationDays: 3,
  maxResponsesPerDrop: 500,
  allowAnonymousGlobal: true,
  allowPublicRegistration: true
};

const NOW = Date.now();

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    title: '✨ Selamat Datang di Fitur Baru KEPOIN This or That!',
    content: 'Sekarang Admin dapat membuat polling seru "This or That" langsung dari panel admin. Yuk berikan suara dan diskusikan pilihanmu di beranda!',
    category: 'UPDATE',
    createdAt: new Date(NOW - 3600 * 1000).toISOString(),
    active: true,
    adminName: 'Admin Kepoin'
  },
  {
    id: 'ann_2',
    title: '🛡️ Pembaruan Sistem Keamanan & Moderasi',
    content: 'Fitur pelaporan konten dan menu moderasi admin telah ditingkatkan untuk menjaga kenyamanan komunitas KEPOIN.',
    category: 'INFO',
    createdAt: new Date(NOW - 86400 * 1000).toISOString(),
    active: true,
    adminName: 'Admin Kepoin'
  }
];

export const initialReports: ReportItem[] = [
  {
    id: 'rep_1',
    targetType: 'ASK',
    targetId: 'drop_mcd_kfc',
    targetTitle: 'Mending makan siang McD apa KFC hari ini?',
    targetContent: 'Drop diskusi pilihan menu makan siang favorit anak kantor.',
    targetOwnerName: 'Dimas Raditya',
    targetOwnerUsername: '@dimasr',
    targetOwnerId: 'user_dimas',
    reportedBy: '@citra.art',
    reporterId: 'user_citra',
    reason: 'SPAM',
    description: 'Postingan terindikasi promosi berulang tanpa variasi konten.',
    createdAt: new Date(NOW - 35 * 60 * 1000).toISOString(),
    status: 'PENDING',
    actionTaken: 'NONE'
  },
  {
    id: 'rep_2',
    targetType: 'ANSWER',
    targetId: 'resp_curhat_spam',
    targetTitle: 'Komentar jawaban mengandung kata kasar',
    targetContent: 'anjink bgt lu semua ga jelas',
    targetOwnerName: 'Anonymous User',
    targetOwnerUsername: 'Anonim',
    reportedBy: '@raka.pm',
    reporterId: 'user_raka',
    reason: 'PROFANITY',
    description: 'Menggunakan kata kasar dan memprovokasi pengguna lain.',
    createdAt: new Date(NOW - 90 * 60 * 1000).toISOString(),
    status: 'PENDING',
    actionTaken: 'NONE'
  },
  {
    id: 'rep_3',
    targetType: 'TALK',
    targetId: 'talk_toxic_99',
    targetTitle: 'Obrolan toxic di bawah foto outfit',
    targetContent: 'norak banget lu mending hapus akun deh',
    targetOwnerName: 'Bima Satria',
    targetOwnerUsername: '@bimasatria',
    targetOwnerId: 'user_bima',
    reportedBy: '@salsa.jpg',
    reporterId: 'user_salsa',
    reason: 'HARASSMENT',
    description: 'Pelecehan personal dan cyberbullying pada obrolan foto.',
    createdAt: new Date(NOW - 180 * 60 * 1000).toISOString(),
    status: 'PENDING',
    actionTaken: 'NONE'
  },
  {
    id: 'rep_4',
    targetType: 'USER',
    targetId: 'user_spammer1',
    targetTitle: 'Akun terindikasi bot link spam',
    targetContent: 'User membagikan link promosi di bio dan komentar.',
    targetOwnerName: 'Promo Hemat',
    targetOwnerUsername: '@promo_slot88',
    targetOwnerId: 'user_spammer1',
    reportedBy: '@minekaze',
    reporterId: 'user_minekaze',
    reason: 'SPAM',
    description: 'Bot yang terus mengirimkan komentar promosi link.',
    createdAt: new Date(NOW - 360 * 60 * 1000).toISOString(),
    status: 'PENDING',
    actionTaken: 'NONE'
  },
  {
    id: 'rep_5',
    targetType: 'ASK',
    targetId: 'drop_resolved_1',
    targetTitle: 'Drop lama yang sudah ditindak',
    targetContent: 'Konten spam telah disembunyikan oleh sistem.',
    targetOwnerName: 'Guest User',
    targetOwnerUsername: '@guest_test',
    reportedBy: '@kevin.ch',
    reason: 'INAPPROPRIATE',
    description: 'Gambar tidak sesuai ketentuan komunitas.',
    createdAt: new Date(NOW - 800 * 60 * 1000).toISOString(),
    status: 'RESOLVED',
    actionTaken: 'HIDDEN',
    reviewedAt: new Date(NOW - 720 * 60 * 1000).toISOString()
  }
];

export const initialDailyThisOrThat: DailyThisOrThat = {
  id: 'daily_default_1',
  prompt: 'Kopi Kenangan vs Kopi Tuku?',
  optionA: '☕ Kopi Kenangan',
  optionB: '🥛 Kopi Tuku (Tetangga)',
  votesA: 1243,
  votesB: 842,
  votedUserIds: [],
  updatedAt: new Date(NOW - 3600 * 1000).toISOString()
};

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'act_1',
    action: 'New Drop Created',
    detail: 'User @minekaze membuat Ask baru "Ayam atau Daging?" (CHOICE)',
    actor: '@minekaze',
    timestamp: new Date(NOW - 15 * 60 * 1000).toISOString(),
    type: 'ASK'
  },
  {
    id: 'act_2',
    action: 'Report Submitted',
    detail: 'User @citra.art melaporkan Ask #drop_mcd_kfc karena SPAM',
    actor: '@citra.art',
    timestamp: new Date(NOW - 35 * 60 * 1000).toISOString(),
    type: 'REPORT'
  },
  {
    id: 'act_3',
    action: 'User Registered',
    detail: 'Pengguna baru bergabung: @raka.pm (Raka Pratama)',
    actor: '@raka.pm',
    timestamp: new Date(NOW - 120 * 60 * 1000).toISOString(),
    type: 'USER'
  },
  {
    id: 'act_4',
    action: 'Response Submitted',
    detail: 'Jawaban baru pada Ask "Spill foto kopi pagi ini" oleh @salsa.jpg',
    actor: '@salsa.jpg',
    timestamp: new Date(NOW - 240 * 60 * 1000).toISOString(),
    type: 'ANSWER'
  },
  {
    id: 'act_5',
    action: 'Content Hidden',
    detail: 'Moderasi menyembunyikan Ask #drop_resolved_1 (Inappropriate content)',
    actor: 'Admin',
    timestamp: new Date(NOW - 720 * 60 * 1000).toISOString(),
    type: 'MODERATION'
  }
];
