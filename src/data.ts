/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DropBoard, DropResponse, UserProfile, Talk, AppNotification } from './types';
import { censorProfanity } from './lib/profanity';

// Base reference time
const NOW = new Date('2026-08-16T18:30:00.000Z').getTime();

export const currentUser: UserProfile = {
  id: 'user_minekaze',
  name: 'Minekaze',
  username: '@minekaze',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minekaze',
  bio: 'Exploring Indonesian internet culture, coffee places & tech.',
  location: 'Jakarta',
  joinedAt: '2026-08-01T00:00:00.000Z',
};

export const demoUser: UserProfile = {
  id: 'user_demo',
  name: 'Demo User',
  username: '@demo',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUserAccount',
  bio: 'Akun testing development KEPOIN. Bebas dipakai untuk coba semua fitur.',
  location: 'Indonesia',
  joinedAt: '2026-08-10T00:00:00.000Z',
};

// 20 Realistic Indonesian Dummy User Profiles
export const dummyUsers: UserProfile[] = [
  demoUser,
  {
    id: 'user_raka',
    name: 'Raka Pratama',
    username: '@raka.pm',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RakaPratama',
    bio: 'tech, coffee, random photography 📸',
    location: 'Bandung',
    joinedAt: '2026-08-02T10:00:00.000Z',
  },
  {
    id: 'user_salsa',
    name: 'Salsa',
    username: '@salsa.jpg',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SalsaJpg',
    bio: 'mostly here at night ✨ playlist curator',
    location: 'Jakarta',
    joinedAt: '2026-08-03T14:30:00.000Z',
  },
  {
    id: 'user_dimas',
    name: 'Dimas Raditya',
    username: '@dimasr',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DimasRaditya',
    bio: 'anak kos + kopi ☕ penikmat kuliner',
    location: 'Malang',
    joinedAt: '2026-08-03T08:15:00.000Z',
  },
  {
    id: 'user_naya',
    name: 'Naya',
    username: '@nayaaja',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NayaAja',
    bio: 'lagi nyari playlist baru 🎧 coffee addict',
    location: 'Surabaya',
    joinedAt: '2026-08-04T12:00:00.000Z',
  },
  {
    id: 'user_fajar',
    name: 'Fajar',
    username: '@fajarrr',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FajarBekasi',
    bio: 'kerja, gaming, tidur, repeat 🎮',
    location: 'Bekasi',
    joinedAt: '2026-08-04T18:40:00.000Z',
  },
  {
    id: 'user_bayu',
    name: 'Bayu Kurniawan',
    username: '@bayu_k',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BayuKurniawan',
    bio: 'desain grafis, visual arts & street food 🎨',
    location: 'Yogyakarta',
    joinedAt: '2026-08-05T09:20:00.000Z',
  },
  {
    id: 'user_tiara',
    name: 'Tiara Safitri',
    username: '@tiara.s',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TiaraSafitri',
    bio: 'aesthetic feed enthusiast 🌸 cafe hopper',
    location: 'Jakarta Selatan',
    joinedAt: '2026-08-05T15:10:00.000Z',
  },
  {
    id: 'user_nadia',
    name: 'Nadia',
    username: '@nadiaa',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NadiaBandung',
    bio: 'suka makan mie ayam & jalan-jalan sore 🍃',
    location: 'Bandung',
    joinedAt: '2026-08-06T11:05:00.000Z',
  },
  {
    id: 'user_kevin',
    name: 'Kevin Darmawan',
    username: '@kevin_d',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KevinDarmawan',
    bio: 'frontend dev yang selalu butuh es kopi susu 💻',
    location: 'Tangerang',
    joinedAt: '2026-08-06T19:30:00.000Z',
  },
  {
    id: 'user_alya',
    name: 'Alya Maharani',
    username: '@alya.m',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlyaMaharani',
    bio: 'mahasiswa semester akhir tolong 😭',
    location: 'Semarang',
    joinedAt: '2026-08-07T08:00:00.000Z',
  },
  {
    id: 'user_rizky',
    name: 'Rizky Pratama',
    username: '@rizky_p',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RizkyPratama',
    bio: 'wibu terselubung & indie music nerd 🎸',
    location: 'Depok',
    joinedAt: '2026-08-07T21:45:00.000Z',
  },
  {
    id: 'user_clara',
    name: 'Clara Setiawan',
    username: '@clara.s',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ClaraSetiawan',
    bio: 'fashion, matcha, and film reviews 🍵',
    location: 'Jakarta Barat',
    joinedAt: '2026-08-08T13:15:00.000Z',
  },
  {
    id: 'user_budi',
    name: 'Budi Santoso',
    username: '@budi_s',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiSantoso',
    bio: 'gowes pagi, santai malam 🚴‍♂️',
    location: 'Solo',
    joinedAt: '2026-08-08T17:50:00.000Z',
  },
  {
    id: 'user_annisa',
    name: 'Annisa Rahma',
    username: '@annisa.r',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnnisaRahma',
    bio: 'pecinta kucing & bakery hunting 🐱🥐',
    location: 'Bogor',
    joinedAt: '2026-08-09T10:30:00.000Z',
  },
  {
    id: 'user_gilang',
    name: 'Gilang Ramadhan',
    username: '@gilang.r',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GilangRamadhan',
    bio: 'street photography & kuliner malam 📷',
    location: 'Medan',
    joinedAt: '2026-08-09T22:10:00.000Z',
  },
  {
    id: 'user_putri',
    name: 'Putri Wulandari',
    username: '@putri_w',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PutriWulandari',
    bio: 'beach, sunset, and good vibes 🌊',
    location: 'Bali',
    joinedAt: '2026-08-10T14:20:00.000Z',
  },
  {
    id: 'user_adit',
    name: 'Adit Saputra',
    username: '@adit_saputra',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AditSaputra',
    bio: 'sneakers & casual lifestyle 👟',
    location: 'Surabaya',
    joinedAt: '2026-08-11T16:00:00.000Z',
  },
  {
    id: 'user_zahra',
    name: 'Zahra Khairunnisa',
    username: '@zahra_k',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZahraKhairunnisa',
    bio: 'baca buku sambil denger lo-fi 📖',
    location: 'Bandung',
    joinedAt: '2026-08-11T20:30:00.000Z',
  },
  {
    id: 'user_jovan',
    name: 'Jovan Lee',
    username: '@jovan.lee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JovanLee',
    bio: 'gadget geek & tech reviewer ⚡',
    location: 'Jakarta Utara',
    joinedAt: '2026-08-12T11:45:00.000Z',
  },
  {
    id: 'user_vina',
    name: 'Vina Lestari',
    username: '@vina_l',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VinaLestari',
    bio: 'hunting tempat ngopi estetik ✨',
    location: 'Malang',
    joinedAt: '2026-08-12T19:00:00.000Z',
  },
];

// Helper timestamps (Relative to NOW)
const minutesAgo = (m: number) => new Date(NOW - m * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(NOW - h * 3600 * 1000).toISOString();
const daysAgo = (d: number) => new Date(NOW - d * 24 * 3600 * 1000).toISOString();
const inDays = (d: number) => new Date(NOW + d * 24 * 3600 * 1000).toISOString();

// 7 KEPOIN TODAY Daily Activities (Monday - Sunday)
export const kepoinTodayActivities = [
  { dayIndex: 0, dayName: 'SUNDAY', dayId: 'Minggu', prompt: 'Foto hal kecil yang bikin kamu senang hari ini?', type: 'PHOTO' as const },
  { dayIndex: 1, dayName: 'MONDAY', dayId: 'Senin', prompt: 'Lagi makan apa hari ini?', type: 'PHOTO' as const },
  { dayIndex: 2, dayName: 'TUESDAY', dayId: 'Selasa', prompt: 'Show your workspace / meja belajar.', type: 'PHOTO' as const },
  { dayIndex: 3, dayName: 'WEDNESDAY', dayId: 'Rabu', prompt: 'Berapa harga kopi di tempat kalian?', type: 'NUMBER' as const },
  { dayIndex: 4, dayName: 'THURSDAY', dayId: 'Kamis', prompt: 'Apa lagu yang lagi kalian puter?', type: 'SONG' as const },
  { dayIndex: 5, dayName: 'FRIDAY', dayId: 'Jumat', prompt: 'Spot ngopi terfavorit minggu ini?', type: 'PLACE' as const },
  { dayIndex: 6, dayName: 'SATURDAY', dayId: 'Sabtu', prompt: 'Foto barang yang baru kalian beli minggu ini.', type: 'PHOTO' as const },
];

export function getCurrentDailyActivity() {
  const currentDayIndex = new Date(NOW).getDay();
  return kepoinTodayActivities.find(a => a.dayIndex === currentDayIndex) || kepoinTodayActivities[0];
}

// ==========================================
// 1. TRENDING DROPS (Diverse types: PHOTO, SONG, PLACE, NUMBER, TEXT)
// ==========================================
export const trendingDrops: DropBoard[] = [
  {
    id: 'trend_1',
    slug: 'lagi-makan-apa-hari-ini',
    prompt: 'Lagi makan apa hari ini?',
    description: 'Spill foto makanan atau camilan kalian hari ini dong 🍜',
    type: 'PHOTO',
    ownerId: 'user_raka',
    createdAt: hoursAgo(6),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bandung',
    category: 'Food',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 420, saves: 58 }
  },
  {
    id: 'trend_2',
    slug: 'show-meja-kerja-kalian',
    prompt: 'Show meja kerja / belajar kalian dong 💻',
    description: 'Drop foto setup meja kerja / belajar kalian saat ini, aesthetic or messy are welcome!',
    type: 'PHOTO',
    ownerId: 'user_dimas',
    createdAt: hoursAgo(2),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Malang',
    category: 'Work',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 380, saves: 49 }
  },
  {
    id: 'trend_3',
    slug: 'foto-langit-sore-di-kota-kalian',
    prompt: 'Foto langit sore / sunset di kota kalian hari ini 🌅',
    description: 'Bagi view senja dari balkon, kosan, jalanan, atau rooftop kalian!',
    type: 'PHOTO',
    ownerId: 'user_putri',
    createdAt: hoursAgo(4),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bali',
    category: 'Nature',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 310, saves: 44 }
  },
  {
    id: 'trend_4',
    slug: 'apa-lagu-yang-lagi-kalian-puter',
    prompt: 'Apa lagu yang lagi kalian puter sekarang? 🎧',
    description: 'Lagi on-repeat lagu apa sekarang? Share judul & artist biar nambah playlist!',
    type: 'SONG',
    ownerId: 'user_rizky',
    createdAt: hoursAgo(8),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Depok',
    category: 'Music',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 275, saves: 38 }
  },
  {
    id: 'trend_5',
    slug: 'kucing-kalian-lagi-ngapain',
    prompt: 'Kucing kalian lagi ngapain sekarang? 🐱',
    description: 'Drop foto anabul kalian yang lagi tidur, berantem, atau bertingkah random.',
    type: 'PHOTO',
    ownerId: 'user_annisa',
    createdAt: hoursAgo(5),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bogor',
    category: 'Pets',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 360, saves: 65 }
  },
  {
    id: 'trend_6',
    slug: 'spill-coffee-shop-hidden-gem',
    prompt: 'Spill coffee shop hidden gem yang paling pewe buat nugas / WFC 📍',
    description: 'Drop nama tempat, kota, dan menu andalan yang wajib dicoba!',
    type: 'PLACE',
    ownerId: 'user_tiara',
    createdAt: hoursAgo(10),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Jakarta Selatan',
    category: 'Coffee',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 290, saves: 52 }
  },
  {
    id: 'trend_7',
    slug: 'kalian-kalau-ngopi-biasanya-habis-berapa',
    prompt: 'Kalian kalau ngopi biasanya habis berapa sekali nongkrong? 💸',
    description: 'Berapa rata-rata budget kopi sekali nongkrong / pesen ojol di kota kalian?',
    type: 'NUMBER',
    ownerId: 'user_naya',
    createdAt: hoursAgo(7),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Surabaya',
    category: 'Lifestyle',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 240, saves: 31 }
  },
  {
    id: 'trend_8',
    slug: 'ootd-sepatu-yang-dipakai-hari-ini',
    prompt: 'OOTD / sepatu yang lagi dipakai hari ini 👟',
    description: 'Sepatu atau outfit andalan kalian hari ini!',
    type: 'PHOTO',
    ownerId: 'user_adit',
    createdAt: hoursAgo(9),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Surabaya',
    category: 'Fashion',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 215, saves: 27 }
  },
  {
    id: 'trend_9',
    slug: 'kuliner-malam-legendaris-kota-kalian',
    prompt: 'Kuliner malam legendaris di kota kalian yang wajib dicoba 🌙',
    description: 'Tempat makan malam / midnight snack langganan yang gak pernah gagal!',
    type: 'PLACE',
    ownerId: 'user_nadia',
    createdAt: hoursAgo(12),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bandung',
    category: 'Food',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 320, saves: 48 }
  },
  {
    id: 'trend_10',
    slug: 'wallpaper-hp-kalian-sekarang-apa',
    prompt: 'Wallpaper / Lockscreen HP kalian sekarang apa? 📱',
    description: 'Screenshot lockscreen or homescreen kalian 👀',
    type: 'PHOTO',
    ownerId: 'user_bayu',
    createdAt: hoursAgo(14),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Yogyakarta',
    category: 'Lifestyle',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 198, saves: 25 }
  },
  {
    id: 'trend_11',
    slug: 'hal-paling-random-yang-kepikiran-pas-bengong',
    prompt: 'Hal paling random yang kepikiran pas lagi bengong? 💭',
    description: 'Ceritain pemikiran absurd, teori konyol, atau uneg-uneg kalian wkwk',
    type: 'TEXT',
    ownerId: 'user_fajar',
    createdAt: hoursAgo(16),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bekasi',
    category: 'Random',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 180, saves: 22 }
  },
  {
    id: 'trend_12',
    slug: 'lagu-indonesia-paling-ngena-pas-overthinking',
    prompt: 'Lagu Indonesia paling ngena pas lagi overthinking? 🌙',
    description: 'Lagu yang liriknya paling nusuk atau nenangin pas malam hari.',
    type: 'SONG',
    ownerId: 'user_salsa',
    createdAt: hoursAgo(18),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Jakarta',
    category: 'Music',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 310, saves: 61 }
  },
  {
    id: 'trend_13',
    slug: 'spot-kopi-terfavorit-minggu-ini',
    prompt: 'Spot kopi terfavorit kalian minggu ini ☕',
    description: 'Drop foto cangkir kopi / cafe favorit kalian!',
    type: 'PHOTO',
    ownerId: 'user_clara',
    createdAt: hoursAgo(20),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Jakarta Barat',
    category: 'Coffee',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 245, saves: 33 }
  },
  {
    id: 'trend_14',
    slug: 'keresahan-anak-kos-fresh-grad',
    prompt: 'Keresahan anak kos / fresh graduate yang paling relate 🥲',
    description: 'Bebas curhat, keluh kesah kehidupan sehari-hari.',
    type: 'TEXT',
    ownerId: 'user_alya',
    createdAt: hoursAgo(22),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Semarang',
    category: 'Relatable',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 260, saves: 40 }
  },
  {
    id: 'trend_15',
    slug: 'sisa-persentase-baterai-hp-sekarang',
    prompt: 'Sisa persentase baterai HP kalian sekarang tinggal berapa? 🔋',
    description: 'Ketik angka baterai kalian saat liat post ini.',
    type: 'NUMBER',
    ownerId: 'user_jovan',
    createdAt: hoursAgo(24),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Jakarta Utara',
    category: 'Gadget',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 190, saves: 18 }
  }
];

// ==========================================
// 2. NEW FRESH DROPS (Diverse types)
// ==========================================
export const newDrops: DropBoard[] = [
  {
    id: 'new_1',
    slug: 'foto-cemilan-samping-laptop',
    prompt: 'Foto cemilan di samping laptop / meja kalian detik ini 🍪',
    description: 'Lagi ngemil apa sambil kerja / kuliah / santai?',
    type: 'PHOTO',
    ownerId: 'user_annisa',
    createdAt: minutesAgo(5),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bogor',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 18, saves: 4 }
  },
  {
    id: 'new_2',
    slug: 'lagu-yang-bikin-semangat-ngoding-kerja',
    prompt: 'Lagu yang bikin semangat pas ngantuk kerja / ngoding ⚡',
    description: 'Genre apa aja yang beat-nya bikin fokus melek!',
    type: 'SONG',
    ownerId: 'user_kevin',
    createdAt: minutesAgo(12),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Tangerang',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 25, saves: 6 }
  },
  {
    id: 'new_3',
    slug: 'isi-tas-kalian-hari-ini',
    prompt: 'Isi tas kalian hari ini ada barang apa aja? 🎒',
    description: 'Drop foto barang bawaan kalian (Everyday Carry essentials).',
    type: 'PHOTO',
    ownerId: 'user_tiara',
    createdAt: minutesAgo(25),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Jakarta Selatan',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 32, saves: 7 }
  },
  {
    id: 'new_4',
    slug: 'spot-healing-jalan-santai-weekend',
    prompt: 'Spot jalan santai / healing terbaik saat weekend 🍃',
    description: 'Taman kota, pedestrian, atau tempat sejuk yang gratis / murah.',
    type: 'PLACE',
    ownerId: 'user_budi',
    createdAt: minutesAgo(40),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Solo',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 28, saves: 5 }
  },
  {
    id: 'new_5',
    slug: 'rata-rata-jam-tidur-tiap-malam',
    prompt: 'Rata-rata jam berapa kalian tidur tiap malam? ⏰',
    description: 'Tulis jam tidur normal kalian (misal: 01:00 atau 23:30).',
    type: 'NUMBER',
    ownerId: 'user_dimas',
    createdAt: hoursAgo(1),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Malang',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 35, saves: 6 }
  },
  {
    id: 'new_6',
    slug: 'barang-paling-berguna-baru-dibeli',
    prompt: 'Barang paling berguna yang baru kalian beli 📦',
    description: 'Spill racun belanjaan yang beneran kepake banget!',
    type: 'PHOTO',
    ownerId: 'user_jovan',
    createdAt: hoursAgo(1),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Jakarta Utara',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 42, saves: 9 }
  },
  {
    id: 'new_7',
    slug: 'pesan-buat-diri-sendiri-minggu-ini',
    prompt: 'Pesan singkat buat diri sendiri sebelum mulai minggu ini ✨',
    description: 'Tulis satu kalimat motivasi atau pengingat santai.',
    type: 'TEXT',
    ownerId: 'user_zahra',
    createdAt: hoursAgo(2),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bandung',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 29, saves: 8 }
  },
  {
    id: 'new_8',
    slug: 'tempat-makan-bakso-terenak-versi-kamu',
    prompt: 'Tempat makan mie / bakso terenak versi kalian 🍜',
    description: 'Share nama warung / depot bakso langganan kalian!',
    type: 'PLACE',
    ownerId: 'user_nadia',
    createdAt: hoursAgo(2),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bandung',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 48, saves: 11 }
  },
  {
    id: 'new_9',
    slug: 'buku-bacaan-yang-lagi-dibuka',
    prompt: 'Buku / bacaan yang lagi kalian baca saat ini 📖',
    description: 'Buku non-fiksi, novel, atau komik favorit.',
    type: 'PHOTO',
    ownerId: 'user_zahra',
    createdAt: hoursAgo(3),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bandung',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 22, saves: 5 }
  },
  {
    id: 'new_10',
    slug: 'lagu-nostalgia-smp-sma-masih-enak',
    prompt: 'Lagu nostalgia jaman SMP/SMA yang masih enak didenger 📻',
    description: 'Lagu yang langsung ngebawa memori jaman sekolah.',
    type: 'SONG',
    ownerId: 'user_rizky',
    createdAt: hoursAgo(3),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Depok',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 37, saves: 7 }
  },
  {
    id: 'new_11',
    slug: 'waktu-commute-ke-kantor-kampus',
    prompt: 'Berapa menit waktu tempuh perjalanan kalian ke kantor / kampus? 🛵',
    description: 'Tulis estimasi waktu perjalanan harian kalian dalam menit.',
    type: 'NUMBER',
    ownerId: 'user_fajar',
    createdAt: hoursAgo(4),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bekasi',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 41, saves: 5 }
  },
  {
    id: 'new_12',
    slug: 'pemandangan-dari-jendela-kamar',
    prompt: 'Foto pemandangan dari jendela kamar / kosan kalian 🪟',
    description: 'View luar jendela kalian sekarang kayak gimana?',
    type: 'PHOTO',
    ownerId: 'user_putri',
    createdAt: hoursAgo(4),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bali',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 50, saves: 12 }
  }
];

// ==========================================
// 3. MINIMAL NATURAL POLLS / CHOICES (Only 2-3 drops, not dominating)
// ==========================================
export const pollDrops: DropBoard[] = [
  {
    id: 'poll_1',
    slug: 'bubur-ayam-diaduk-vs-tidak-diaduk',
    prompt: 'Bubur ayam: diaduk vs tidak diaduk? 🥣',
    description: 'Perdebatan abadi kuliner Indonesia sepanjang masa.',
    type: 'CHOICE',
    ownerId: 'user_dimas',
    createdAt: hoursAgo(15),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Malang',
    settings: {
      allowAnonymous: true,
      allowReactions: true,
      showPublicly: true,
      allowTalks: true,
      options: ['Diaduk (Nikmat Merata)', 'Tidak Diaduk (Estetik & Rapi)']
    },
    stats: { views: 520, saves: 38 }
  },
  {
    id: 'poll_2',
    slug: 'nongkrong-ramean-vs-me-time',
    prompt: 'Nongkrong ramean vs me-time sendirian? 👥',
    description: 'Tipe recharge energi sosial kalian kalau lagi senggang.',
    type: 'CHOICE',
    ownerId: 'user_salsa',
    createdAt: hoursAgo(18),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Jakarta',
    settings: {
      allowAnonymous: true,
      allowReactions: true,
      showPublicly: true,
      allowTalks: true,
      options: ['Ramean bareng temen 🎉', 'Me-time santai sendiri 🎧']
    },
    stats: { views: 430, saves: 29 }
  },
  {
    id: 'poll_3',
    slug: 'wfh-vs-wfo-mana-lebih-enak',
    prompt: 'WFH (Work From Home) vs WFO (Work From Office)? 🏢',
    description: 'Kalau boleh milih, kalian lebih produktif di mana?',
    type: 'CHOICE',
    ownerId: 'user_raka',
    createdAt: hoursAgo(20),
    expiresAt: inDays(3),
    status: 'ACTIVE',
    location: 'Bandung',
    settings: {
      allowAnonymous: true,
      allowReactions: true,
      showPublicly: true,
      allowTalks: true,
      options: ['WFH (Nyaman di Rumah) 🏠', 'WFO (Fokus & Ganti Suasana) 💼']
    },
    stats: { views: 390, saves: 24 }
  }
];

// ==========================================
// 4. EXPIRED DROPS FOR TESTING
// ==========================================
export const expiredDrops: DropBoard[] = [
  {
    id: 'exp_1',
    slug: 'expired-buku-terakhir-kalian',
    prompt: 'Buku terakhir yang kalian tamatin?',
    description: 'Rekomendasi bacaan buat akhir pekan.',
    type: 'TEXT',
    ownerId: 'user_zahra',
    createdAt: daysAgo(5),
    expiresAt: daysAgo(2),
    status: 'EXPIRED',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 64, saves: 12 }
  },
  {
    id: 'exp_2',
    slug: 'expired-snack-favorit',
    prompt: 'Snack micin favorit kalian apa?',
    description: 'Chiki atau keripik andalan pas begadang.',
    type: 'TEXT',
    ownerId: 'user_fajar',
    createdAt: daysAgo(7),
    expiresAt: daysAgo(4),
    status: 'EXPIRED',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 112, saves: 15 }
  },
  {
    id: 'exp_3',
    slug: 'expired-foto-outfit-kampus',
    prompt: 'Outfit andalan pas kuliah / ngantor?',
    description: 'Kemeja flanel atau kaos polos oversize?',
    type: 'PHOTO',
    ownerId: 'user_clara',
    createdAt: daysAgo(6),
    expiresAt: daysAgo(3),
    status: 'EXPIRED',
    settings: { allowAnonymous: true, allowReactions: true, showPublicly: true, allowTalks: true },
    stats: { views: 76, saves: 11 }
  }
];

// All drops combined
export const initialDrops: DropBoard[] = [
  ...trendingDrops,
  ...newDrops,
  ...pollDrops,
  ...expiredDrops
];

// ==========================================
// 5. RICH REALISTIC RESPONSES (Photos, Songs, Places, Numbers, Texts, Choices)
// ==========================================
export const initialResponses: DropResponse[] = [
  // --- trend_1: "Lagi makan apa hari ini?" (PHOTO) ---
  {
    id: 'r_t1_1',
    dropId: 'trend_1',
    userName: 'Dimas Raditya',
    userId: 'user_dimas',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=800',
    caption: 'mie ayam kuah kental langganan depan kampus no debat 🍜',
    createdAt: hoursAgo(5),
    reactions: [{ emoji: '❤️', count: 24, userIds: [] }, { emoji: '🔥', count: 9, userIds: [] }],
    talks: [
      { id: 't_1_1', userName: 'Raka Pratama', content: 'fix mie ayam mana nih bro?', createdAt: hoursAgo(4) },
      { id: 't_1_2', userName: 'Dimas Raditya', content: 'Mie Ayam Pak Gendut depan UB, 15k porsi brutal', createdAt: hoursAgo(4) }
    ]
  },
  {
    id: 'r_t1_2',
    dropId: 'trend_1',
    userName: 'Nadia',
    userId: 'user_nadia',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800',
    caption: 'nasi padang ayam pop + daun singkong kuah gulai kental ✨',
    createdAt: hoursAgo(4),
    reactions: [{ emoji: '❤️', count: 48, userIds: [] }, { emoji: '👍', count: 15, userIds: [] }],
    talks: [
      { id: 't_1_3', userName: 'Kevin Darmawan', content: 'sambel ijonya menggoda banget astaga', createdAt: hoursAgo(3) }
    ]
  },
  {
    id: 'r_t1_3',
    dropId: 'trend_1',
    userName: 'Alya Maharani',
    userId: 'user_alya',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=800',
    caption: 'ayam geprek cabe 10 pelampiasan stres ngerjain bab 4 🌶️',
    createdAt: hoursAgo(3),
    reactions: [{ emoji: '😂', count: 18, userIds: [] }, { emoji: '🔥', count: 12, userIds: [] }],
    talks: [
      { id: 't_1_4', userName: 'Salsa', content: 'semangat skripsiannya kakk! jangan lupa minum susu biar gak mules wkwk', createdAt: hoursAgo(2) }
    ]
  },
  {
    id: 'r_t1_4',
    dropId: 'trend_1',
    userName: 'Anonim',
    isAnonymous: true,
    content: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=800',
    caption: 'indomie soto pake telor setengah mateng + rawit potong 🍳',
    createdAt: hoursAgo(2),
    reactions: [{ emoji: '❤️', count: 92, userIds: [] }, { emoji: '🔥', count: 41, userIds: [] }],
    talks: [
      { id: 't_1_5', userName: 'Gilang Ramadhan', content: 'indomie kuah emang penyelamat peradaban manusia', createdAt: hoursAgo(1) }
    ]
  },
  {
    id: 'r_t1_5',
    dropId: 'trend_1',
    userName: 'Fajar',
    userId: 'user_fajar',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
    caption: 'roti bakar cokelat keju + kopi hitam buat nahan ngantuk',
    createdAt: hoursAgo(1),
    reactions: [{ emoji: '👍', count: 11, userIds: [] }]
  },

  // --- trend_2: "Show meja kerja / belajar kalian dong 💻" (PHOTO) ---
  {
    id: 'r_t2_1',
    dropId: 'trend_2',
    userName: 'Raka Pratama',
    userId: 'user_raka',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800',
    caption: 'MacBook setup, cable management rapi biar pikiran ikutan tenang ✨',
    createdAt: hoursAgo(2),
    reactions: [{ emoji: '🔥', count: 52, userIds: [] }, { emoji: '❤️', count: 34, userIds: [] }],
    talks: [
      { id: 't_2_1', userName: 'Jovan Lee', content: 'clean banget setupnya bang!', createdAt: hoursAgo(1) },
      { id: 't_2_2', userName: 'Kevin Darmawan', content: 'monitor light bar-nya pake merk apa?', createdAt: minutesAgo(50) }
    ]
  },
  {
    id: 'r_t2_2',
    dropId: 'trend_2',
    userName: 'Tiara Safitri',
    userId: 'user_tiara',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800',
    caption: 'warm aesthetic with warm light, diffuser & monstera plant 🌿',
    createdAt: hoursAgo(1),
    reactions: [{ emoji: '❤️', count: 41, userIds: [] }, { emoji: '✨', count: 20, userIds: [] }]
  },
  {
    id: 'r_t2_3',
    dropId: 'trend_2',
    userName: 'Kevin Darmawan',
    userId: 'user_kevin',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
    caption: 'meja dev sejati: 3 gelas kopi, post-it note bertebaran, & mechanical keyboard',
    createdAt: minutesAgo(50),
    reactions: [{ emoji: '😂', count: 28, userIds: [] }, { emoji: '👍', count: 14, userIds: [] }],
    talks: [
      { id: 't_2_3', userName: 'Bayu Kurniawan', content: 'ini baru meja kerja manusia beneran haha', createdAt: minutesAgo(30) }
    ]
  },

  // --- trend_3: "Foto langit sore / sunset di kota kalian hari ini 🌅" (PHOTO) ---
  {
    id: 'r_t3_1',
    dropId: 'trend_3',
    userName: 'Putri Wulandari',
    userId: 'user_putri',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    caption: 'sunset Canggu Bali sore ini beneran magic banget warnanya 🌊',
    createdAt: hoursAgo(3),
    reactions: [{ emoji: '❤️', count: 68, userIds: [] }, { emoji: '🔥', count: 22, userIds: [] }],
    talks: [
      { id: 't_3_1', userName: 'Tiara Safitri', content: 'iri banget pengen liburan ke Bali 😭', createdAt: hoursAgo(2) }
    ]
  },
  {
    id: 'r_t3_2',
    dropId: 'trend_3',
    userName: 'Bayu Kurniawan',
    userId: 'user_bayu',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&q=80&w=800',
    caption: 'langit senja oranye di atas sawah Bantul Jogja 🌾',
    createdAt: hoursAgo(2),
    reactions: [{ emoji: '❤️', count: 54, userIds: [] }, { emoji: '✨', count: 19, userIds: [] }]
  },
  {
    id: 'r_t3_3',
    dropId: 'trend_3',
    userName: 'Salsa',
    userId: 'user_salsa',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
    caption: 'golden hour Jakarta dari jembatan penyeberangan Sudirman',
    createdAt: hoursAgo(1),
    reactions: [{ emoji: '❤️', count: 37, userIds: [] }]
  },

  // --- trend_4: "Apa lagu yang lagi kalian puter sekarang? 🎧" (SONG) ---
  {
    id: 'r_t4_1',
    dropId: 'trend_4',
    userName: 'Salsa',
    userId: 'user_salsa',
    isAnonymous: false,
    content: 'Bernadya - Satu Bulan',
    caption: 'liriknya to the point banget bikin sakit hati tapi enak didenger 😭',
    createdAt: hoursAgo(7),
    reactions: [{ emoji: '❤️', count: 45, userIds: [] }, { emoji: '💔', count: 30, userIds: [] }],
    talks: [
      { id: 't_4_1', userName: 'Alya Maharani', content: 'albumnya gak ada yang skip beneran', createdAt: hoursAgo(6) }
    ]
  },
  {
    id: 'r_t4_2',
    dropId: 'trend_4',
    userName: 'Rizky Pratama',
    userId: 'user_rizky',
    isAnonymous: false,
    content: 'Sal Priadi - Dari planet lain',
    caption: 'lagu paling bikin senyum-senyum sendiri tahun ini ✨',
    createdAt: hoursAgo(6),
    reactions: [{ emoji: '❤️', count: 58, userIds: [] }, { emoji: '✨', count: 25, userIds: [] }]
  },
  {
    id: 'r_t4_3',
    dropId: 'trend_4',
    userName: 'Naya',
    userId: 'user_naya',
    isAnonymous: false,
    content: 'Wave to Earth - Seasons',
    caption: 'vibe sore santai sambil minum kopi',
    createdAt: hoursAgo(5),
    reactions: [{ emoji: '☕', count: 29, userIds: [] }]
  },
  {
    id: 'r_t4_4',
    dropId: 'trend_4',
    userName: 'Dimas Raditya',
    userId: 'user_dimas',
    isAnonymous: false,
    content: 'Hindia - Evaluasi',
    caption: 'lagu wajib pas ngerasa semua hal lagi berantakan',
    createdAt: hoursAgo(4),
    reactions: [{ emoji: '🔥', count: 33, userIds: [] }]
  },

  // --- trend_5: "Kucing kalian lagi ngapain sekarang? 🐱" (PHOTO) ---
  {
    id: 'r_t5_1',
    dropId: 'trend_5',
    userName: 'Annisa Rahma',
    userId: 'user_annisa',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    caption: 'Miko si kucing oren lagi tidur tengkurep kayak roti sobek 🍞',
    createdAt: hoursAgo(4),
    reactions: [{ emoji: '❤️', count: 85, userIds: [] }, { emoji: '😂', count: 24, userIds: [] }],
    talks: [
      { id: 't_5_1', userName: 'Zahra Khairunnisa', content: 'lucu bangeeett mukanya bulet!', createdAt: hoursAgo(3) }
    ]
  },
  {
    id: 'r_t5_2',
    dropId: 'trend_5',
    userName: 'Kevin Darmawan',
    userId: 'user_kevin',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800',
    caption: 'nangkring tepat di atas keyboard pas lagi ngepush codingan wkwk',
    createdAt: hoursAgo(3),
    reactions: [{ emoji: '😂', count: 42, userIds: [] }, { emoji: '❤️', count: 31, userIds: [] }]
  },
  {
    id: 'r_t5_3',
    dropId: 'trend_5',
    userName: 'Clara Setiawan',
    userId: 'user_clara',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
    caption: 'kucing pinter duduk manis nungguin jatah cemilan sore 🐾',
    createdAt: hoursAgo(2),
    reactions: [{ emoji: '❤️', count: 61, userIds: [] }]
  },

  // --- trend_6: "Spill coffee shop hidden gem yang paling pewe buat nugas / WFC 📍" (PLACE) ---
  {
    id: 'r_t6_1',
    dropId: 'trend_6',
    userName: 'Raka Pratama',
    userId: 'user_raka',
    isAnonymous: false,
    content: 'Kozi Coffee Dipatiukur, Bandung',
    caption: 'suasananya adem, banyak colokan, cold brew-nya juara banget',
    createdAt: hoursAgo(9),
    reactions: [{ emoji: '🔥', count: 38, userIds: [] }, { emoji: '☕', count: 27, userIds: [] }],
    talks: [
      { id: 't_6_1', userName: 'Nadia', content: 'setuju banget, playlist lagunya juga enak-enak', createdAt: hoursAgo(8) }
    ]
  },
  {
    id: 'r_t6_2',
    dropId: 'trend_6',
    userName: 'Tiara Safitri',
    userId: 'user_tiara',
    isAnonymous: false,
    content: 'Kopi Kalyan Senopati, Jakarta Selatan',
    caption: 'space luas, roti canai sama es kopi kalyan-nya wajib order!',
    createdAt: hoursAgo(8),
    reactions: [{ emoji: '❤️', count: 44, userIds: [] }]
  },
  {
    id: 'r_t6_3',
    dropId: 'trend_6',
    userName: 'Dimas Raditya',
    userId: 'user_dimas',
    isAnonymous: false,
    content: 'Kopi Lonceng Kayutangan, Malang',
    caption: 'vibe vintage heritage, kopi tubruk mantap harga mahasiswa',
    createdAt: hoursAgo(6),
    reactions: [{ emoji: '👍', count: 26, userIds: [] }]
  },

  // --- trend_7: "Kalian kalau ngopi biasanya habis berapa sekali nongkrong? 💸" (NUMBER) ---
  {
    id: 'r_t7_1',
    dropId: 'trend_7',
    userName: 'Dimas Raditya',
    userId: 'user_dimas',
    isAnonymous: false,
    content: 18000,
    caption: '18rb es kopi susu gula aren di warkop modern malang udah dapet wifi banter',
    createdAt: hoursAgo(6),
    reactions: [{ emoji: '👍', count: 31, userIds: [] }]
  },
  {
    id: 'r_t7_2',
    dropId: 'trend_7',
    userName: 'Tiara Safitri',
    userId: 'user_tiara',
    isAnonymous: false,
    content: 48000,
    caption: 'kopi susu oatmilk 48k standar jaksel hiks 💸',
    createdAt: hoursAgo(5),
    reactions: [{ emoji: '😂', count: 52, userIds: [] }]
  },
  {
    id: 'r_t7_3',
    dropId: 'trend_7',
    userName: 'Bayu Kurniawan',
    userId: 'user_bayu',
    isAnonymous: false,
    content: 25000,
    caption: '25rb di Jogja udah dapet filter V60 beans lokal nikmat',
    createdAt: hoursAgo(4),
    reactions: [{ emoji: '☕', count: 29, userIds: [] }]
  },

  // --- trend_8: "OOTD / sepatu yang lagi dipakai hari ini 👟" (PHOTO) ---
  {
    id: 'r_t8_1',
    dropId: 'trend_8',
    userName: 'Adit Saputra',
    userId: 'user_adit',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
    caption: 'sneakers beaters andalan buat keliling kota hari ini 👟',
    createdAt: hoursAgo(8),
    reactions: [{ emoji: '🔥', count: 42, userIds: [] }]
  },
  {
    id: 'r_t8_2',
    dropId: 'trend_8',
    userName: 'Clara Setiawan',
    userId: 'user_clara',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    caption: 'chunky retro sneakers + white socks combo 🤍',
    createdAt: hoursAgo(7),
    reactions: [{ emoji: '❤️', count: 35, userIds: [] }]
  },

  // --- trend_9: "Kuliner malam legendaris di kota kalian yang wajib dicoba 🌙" (PLACE) ---
  {
    id: 'r_t9_1',
    dropId: 'trend_9',
    userName: 'Bayu Kurniawan',
    userId: 'user_bayu',
    isAnonymous: false,
    content: 'Gudeg Sagan, Yogyakarta',
    caption: 'gudeg basah kuah gurih pedes buka sampe malem, no debat',
    createdAt: hoursAgo(11),
    reactions: [{ emoji: '❤️', count: 56, userIds: [] }, { emoji: '🔥', count: 28, userIds: [] }]
  },
  {
    id: 'r_t9_2',
    dropId: 'trend_9',
    userName: 'Nadia',
    userId: 'user_nadia',
    isAnonymous: false,
    content: 'Cuanki Serayu & Ronde Alkateri, Bandung',
    caption: 'makan cuanki kuah panas pas udara Bandung lagi dingin-dinginnya 🥣',
    createdAt: hoursAgo(10),
    reactions: [{ emoji: '❤️', count: 49, userIds: [] }]
  },
  {
    id: 'r_t9_3',
    dropId: 'trend_9',
    userName: 'Gilang Ramadhan',
    userId: 'user_gilang',
    isAnonymous: false,
    content: 'Nasi Goreng Semalam Suntuk, Medan',
    caption: 'porsi barbar daging melimpah buka sampe subuh',
    createdAt: hoursAgo(9),
    reactions: [{ emoji: '🔥', count: 33, userIds: [] }]
  },

  // --- trend_10: "Wallpaper / Lockscreen HP kalian sekarang apa? 📱" (PHOTO) ---
  {
    id: 'r_t10_1',
    dropId: 'trend_10',
    userName: 'Zahra Khairunnisa',
    userId: 'user_zahra',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=800',
    caption: 'wallpaper dedaunan hijau sejuk biar mata rileks pas buka lockscreen 🌿',
    createdAt: hoursAgo(13),
    reactions: [{ emoji: '❤️', count: 28, userIds: [] }]
  },
  {
    id: 'r_t10_2',
    dropId: 'trend_10',
    userName: 'Jovan Lee',
    userId: 'user_jovan',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    caption: 'minimalist landscape wallpaper dark mode AMOLED friendly',
    createdAt: hoursAgo(12),
    reactions: [{ emoji: '🔥', count: 31, userIds: [] }]
  },

  // --- trend_11: "Hal paling random yang kepikiran pas lagi bengong? 💭" (TEXT) ---
  {
    id: 'r_t11_1',
    dropId: 'trend_11',
    userName: 'Fajar',
    userId: 'user_fajar',
    isAnonymous: false,
    content: 'Kenapa kita bisa hafal lirik lagu dari 10 tahun lalu di luar kepala, tapi lupa baru aja naruh kunci motor di mana?',
    caption: 'misteri otak manusia yang belum terpecahkan',
    createdAt: hoursAgo(15),
    reactions: [{ emoji: '😂', count: 74, userIds: [] }, { emoji: '👍', count: 38, userIds: [] }],
    talks: [
      { id: 't_11_1', userName: 'Dimas Raditya', content: 'relate parah wkwk tadi nyari kacamata padahal lagi dipake', createdAt: hoursAgo(14) }
    ]
  },
  {
    id: 'r_t11_2',
    dropId: 'trend_11',
    userName: 'Alya Maharani',
    userId: 'user_alya',
    isAnonymous: false,
    content: 'Kepikiran kalau ikan di laut itu pernah ngerasa haus gak sih? Trus kalau haus dia minum air asin atau gimana 😭',
    createdAt: hoursAgo(14),
    reactions: [{ emoji: '😂', count: 62, userIds: [] }]
  },

  // --- trend_12: "Lagu Indonesia paling ngena pas lagi overthinking? 🌙" (SONG) ---
  {
    id: 'r_t12_1',
    dropId: 'trend_12',
    userName: 'Salsa',
    userId: 'user_salsa',
    isAnonymous: false,
    content: 'Kunto Aji - Rehat',
    caption: '"Tenangkan hati, semua ini bukan salahmu..." beneran pelukan hangat di jam 2 pagi',
    createdAt: hoursAgo(17),
    reactions: [{ emoji: '❤️', count: 88, userIds: [] }, { emoji: '✨', count: 42, userIds: [] }]
  },
  {
    id: 'r_t12_2',
    dropId: 'trend_12',
    userName: 'Rizky Pratama',
    userId: 'user_rizky',
    isAnonymous: false,
    content: 'Pamungkas - Monolog',
    caption: 'alunan gitarnya pas sunyi beneran nusuk',
    createdAt: hoursAgo(16),
    reactions: [{ emoji: '💔', count: 39, userIds: [] }]
  },

  // --- trend_13: "Spot kopi terfavorit kalian minggu ini ☕" (PHOTO) ---
  {
    id: 'r_t13_1',
    dropId: 'trend_13',
    userName: 'Clara Setiawan',
    userId: 'user_clara',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800',
    caption: 'iced matcha espresso di cafe taman dekat rumah 🍵☕',
    createdAt: hoursAgo(19),
    reactions: [{ emoji: '❤️', count: 36, userIds: [] }, { emoji: '✨', count: 18, userIds: [] }]
  },
  {
    id: 'r_t13_2',
    dropId: 'trend_13',
    userName: 'Raka Pratama',
    userId: 'user_raka',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
    caption: 'manual brew Ethiopian beans, notes floral peach manis natural',
    createdAt: hoursAgo(18),
    reactions: [{ emoji: '🔥', count: 29, userIds: [] }]
  },

  // --- trend_14: "Keresahan anak kos / fresh graduate yang paling relate 🥲" (TEXT) ---
  {
    id: 'r_t14_1',
    dropId: 'trend_14',
    userName: 'Alya Maharani',
    userId: 'user_alya',
    isAnonymous: false,
    content: 'Tiap hari mikir keras "hari ini makan apa ya" itu energi mikirnya lebih ngabisin tenaga dibanding ngerjain tugas kuliah 😭',
    createdAt: hoursAgo(21),
    reactions: [{ emoji: '😂', count: 95, userIds: [] }, { emoji: '👍', count: 47, userIds: [] }],
    talks: [
      { id: 't_14_1', userName: 'Dimas Raditya', content: 'ujung-ujungnya beli geprek lagi geprek lagi wkwk', createdAt: hoursAgo(20) }
    ]
  },
  {
    id: 'r_t14_2',
    dropId: 'trend_14',
    userName: 'Kevin Darmawan',
    userId: 'user_kevin',
    isAnonymous: false,
    content: 'Beli sayuran dan buah niatnya hidup sehat, 4 hari kemudian cuma jadi penunggu kulkas yang layu.',
    createdAt: hoursAgo(20),
    reactions: [{ emoji: '😂', count: 81, userIds: [] }]
  },

  // --- trend_15: "Sisa persentase baterai HP kalian sekarang tinggal berapa? 🔋" (NUMBER) ---
  {
    id: 'r_t15_1',
    dropId: 'trend_15',
    userName: 'Jovan Lee',
    userId: 'user_jovan',
    isAnonymous: false,
    content: 14,
    caption: '14% merah nyala tapi mager nyolok charger wkwk',
    createdAt: hoursAgo(23),
    reactions: [{ emoji: '⚡', count: 24, userIds: [] }]
  },
  {
    id: 'r_t15_2',
    dropId: 'trend_15',
    userName: 'Salsa',
    userId: 'user_salsa',
    isAnonymous: false,
    content: 87,
    caption: '87% aman sentosa siap maraton series',
    createdAt: hoursAgo(22),
    reactions: [{ emoji: '👍', count: 18, userIds: [] }]
  },

  // --- new_1: "Foto cemilan di samping laptop / meja kalian detik ini 🍪" (PHOTO) ---
  {
    id: 'r_n1_1',
    dropId: 'new_1',
    userName: 'Annisa Rahma',
    userId: 'user_annisa',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800',
    caption: 'soft baked cookies choco chip yang baru dihangatin 🍪',
    createdAt: minutesAgo(4),
    reactions: [{ emoji: '❤️', count: 12, userIds: [] }]
  },

  // --- new_2: "Lagu yang bikin semangat pas ngantuk kerja / ngoding ⚡" (SONG) ---
  {
    id: 'r_n2_1',
    dropId: 'new_2',
    userName: 'Kevin Darmawan',
    userId: 'user_kevin',
    isAnonymous: false,
    content: 'Polyphia - Playing God',
    caption: 'petikan gitarnya bikin adrenaline langsung naik 100%',
    createdAt: minutesAgo(10),
    reactions: [{ emoji: '🔥', count: 15, userIds: [] }]
  },

  // --- new_3: "Isi tas kalian hari ini ada barang apa aja? 🎒" (PHOTO) ---
  {
    id: 'r_n3_1',
    dropId: 'new_3',
    userName: 'Tiara Safitri',
    userId: 'user_tiara',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    caption: 'EDC essentials: powerbank, lip tint, parfum travel size, TWS & kunci kosan 🎒',
    createdAt: minutesAgo(20),
    reactions: [{ emoji: '❤️', count: 21, userIds: [] }]
  },

  // --- new_4: "Spot jalan santai / healing terbaik saat weekend 🍃" (PLACE) ---
  {
    id: 'r_n4_1',
    dropId: 'new_4',
    userName: 'Tiara Safitri',
    userId: 'user_tiara',
    isAnonymous: false,
    content: 'Taman Literasi Blok M, Jakarta Selatan',
    caption: 'pewe banget sore-sore duduk baca buku sambil liat MRT lewat',
    createdAt: minutesAgo(35),
    reactions: [{ emoji: '✨', count: 19, userIds: [] }]
  },

  // --- new_5: "Rata-rata jam berapa kalian tidur tiap malam? ⏰" (NUMBER) ---
  {
    id: 'r_n5_1',
    dropId: 'new_5',
    userName: 'Dimas Raditya',
    userId: 'user_dimas',
    isAnonymous: false,
    content: 1,
    caption: 'jam 01:30 malam, udah jadi jam biologis anak kos',
    createdAt: minutesAgo(55),
    reactions: [{ emoji: '😴', count: 14, userIds: [] }]
  },

  // --- new_6: "Barang paling berguna yang baru kalian beli 📦" (PHOTO) ---
  {
    id: 'r_n6_1',
    dropId: 'new_6',
    userName: 'Jovan Lee',
    userId: 'user_jovan',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
    caption: 'mechanical keyboard wireless, ngetik jadi jauh lebih satisfying ✨',
    createdAt: hoursAgo(1),
    reactions: [{ emoji: '🔥', count: 26, userIds: [] }]
  },

  // --- new_7: "Pesan singkat buat diri sendiri sebelum mulai minggu ini ✨" (TEXT) ---
  {
    id: 'r_n7_1',
    dropId: 'new_7',
    userName: 'Zahra Khairunnisa',
    userId: 'user_zahra',
    isAnonymous: false,
    content: 'Tarik nafas pelan-pelan, satu-satu diselesain, jangan lupa istirahat yang cukup 🌱',
    caption: 'reminder buat diri sendiri yang gampang cemas',
    createdAt: hoursAgo(2),
    reactions: [{ emoji: '❤️', count: 32, userIds: [] }, { emoji: '✨', count: 18, userIds: [] }]
  },

  // --- new_8: "Tempat makan mie / bakso terenak versi kalian 🍜" (PLACE) ---
  {
    id: 'r_n8_1',
    dropId: 'new_8',
    userName: 'Nadia',
    userId: 'user_nadia',
    isAnonymous: false,
    content: 'Bakso President & Bakso Kota Cak Man, Malang',
    caption: 'sensasi makan bakso di samping rel kereta api, kuah kaldunya gurih nampol!',
    createdAt: hoursAgo(2),
    reactions: [{ emoji: '❤️', count: 41, userIds: [] }, { emoji: '🔥', count: 19, userIds: [] }]
  },

  // --- new_9: "Buku / bacaan yang lagi kalian baca saat ini 📖" (PHOTO) ---
  {
    id: 'r_n9_1',
    dropId: 'new_9',
    userName: 'Zahra Khairunnisa',
    userId: 'user_zahra',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    caption: 're-reading "Filosofi Teras" bab mengendalikan apa yang ada di kendali kita 📖',
    createdAt: hoursAgo(3),
    reactions: [{ emoji: '❤️', count: 27, userIds: [] }]
  },

  // --- new_10: "Lagu nostalgia jaman SMP/SMA yang masih enak didenger 📻" (SONG) ---
  {
    id: 'r_n10_1',
    dropId: 'new_10',
    userName: 'Rizky Pratama',
    userId: 'user_rizky',
    isAnonymous: false,
    content: 'Sheila on 7 - Dan',
    caption: 'intro gitarnya aja udah langsung bikin inget jaman putih abu-abu 🥺',
    createdAt: hoursAgo(3),
    reactions: [{ emoji: '❤️', count: 53, userIds: [] }, { emoji: '🎸', count: 22, userIds: [] }]
  },

  // --- new_11: "Berapa menit waktu tempuh perjalanan kalian ke kantor / kampus? 🛵" (NUMBER) ---
  {
    id: 'r_n11_1',
    dropId: 'new_11',
    userName: 'Fajar',
    userId: 'user_fajar',
    isAnonymous: false,
    content: 45,
    caption: '45 menit naik KRL Bekasi - Manggarai tiap pagi berjuang demi sesuap nasi',
    createdAt: hoursAgo(4),
    reactions: [{ emoji: '🔥', count: 28, userIds: [] }]
  },

  // --- new_12: "Foto pemandangan dari jendela kamar / kosan kalian 🪟" (PHOTO) ---
  {
    id: 'r_n12_1',
    dropId: 'new_12',
    userName: 'Putri Wulandari',
    userId: 'user_putri',
    isAnonymous: false,
    content: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    caption: 'view pagi hari dari jendela kosan, matahari terbit pelan-pelan ☀️',
    createdAt: hoursAgo(4),
    reactions: [{ emoji: '❤️', count: 39, userIds: [] }, { emoji: '✨', count: 14, userIds: [] }]
  },

  // --- poll_1: "Bubur ayam: diaduk vs tidak diaduk? 🥣" (CHOICE) ---
  {
    id: 'r_p1_diaduk',
    dropId: 'poll_1',
    userName: 'Dimas Raditya',
    userId: 'user_dimas',
    isAnonymous: false,
    content: 'Diaduk (Nikmat Merata)',
    caption: 'semua bumbu, cakwe, kerupuk, kuah kuning menyatu sempurna!',
    createdAt: hoursAgo(14),
    reactions: [{ emoji: '🔥', count: 68, userIds: [] }],
    talks: [
      { id: 't_p1_1', userName: 'Rizki', userId: 'user_rizki', content: 'Setuju banget bro, diaduk is the real taste!', createdAt: hoursAgo(13) },
      { id: 't_p1_2', userName: 'Siti', userId: 'user_siti', content: 'Gak tega liat bentuknya tapi emang enak wkwk', createdAt: hoursAgo(12) },
      { id: 't_p1_3', userName: 'Budi', userId: 'user_budi', content: 'Tim bubur diaduk garis keras!', createdAt: hoursAgo(11) },
      { id: 't_p1_4', userName: 'Dewi', userId: 'user_dewi', content: 'Mantap jiwa', createdAt: hoursAgo(10) },
      { id: 't_p1_5', userName: 'Joko', userId: 'user_joko', content: 'Betul sekali!', createdAt: hoursAgo(9) }
    ]
  },
  {
    id: 'r_p1_tidak',
    dropId: 'poll_1',
    userName: 'Tiara Safitri',
    userId: 'user_tiara',
    isAnonymous: false,
    content: 'Tidak Diaduk (Estetik & Rapi)',
    caption: 'teksturnya tetep terjaga, estetik dan gak kayak pakan burung wkwk',
    createdAt: hoursAgo(13),
    reactions: [{ emoji: '✨', count: 54, userIds: [] }],
    talks: [
      { id: 't_p1_6', userName: 'Agus', userId: 'user_agus', content: 'Nah ini baru bener, estetik!', createdAt: hoursAgo(12) },
      { id: 't_p1_7', userName: 'Putri', userId: 'user_putri', content: 'Sensasi rasa tiap suapan beda-beda, seru!', createdAt: hoursAgo(9) },
      { id: 't_p1_8', userName: 'Siska', userId: 'user_siska', content: 'Tim tidak diaduk hadir!', createdAt: hoursAgo(8) },
      { id: 't_p1_9', userName: 'Doni', userId: 'user_doni', content: 'Lebih rapi dan gurih', createdAt: hoursAgo(7) },
      { id: 't_p1_10', userName: 'Ani', userId: 'user_ani', content: 'Setuju kak!', createdAt: hoursAgo(6) },
      { id: 't_p1_11', userName: 'Rian', userId: 'user_rian', content: 'Mantap', createdAt: hoursAgo(5) }
    ]
  },
  ...Array.from({ length: 33 }, (_, i) => ({
    id: `r_p1_extra_${i + 1}`,
    dropId: 'poll_1',
    userName: `Warga Bubur ${i + 1}`,
    userId: `user_warga_${i + 1}`,
    isAnonymous: i % 2 === 0,
    content: i % 2 === 0 ? 'Diaduk (Nikmat Merata)' : 'Tidak Diaduk (Estetik & Rapi)',
    caption: i % 3 === 0 ? 'Sarapan pagi paling juara' : 'Bubur ayam legend sih ini',
    createdAt: hoursAgo(12 - (i % 10)),
    reactions: [{ emoji: i % 2 === 0 ? '🔥' : '❤️', count: 10 + (i % 20), userIds: [] }],
    talks: i === 0 ? [
      { id: 't_p1_12', userName: 'Maya', userId: 'user_maya', content: 'Top banget', createdAt: hoursAgo(4) },
      { id: 't_p1_13', userName: 'Eko', userId: 'user_eko', content: 'Setuju', createdAt: hoursAgo(3) }
    ] : undefined
  })),

  // --- poll_2: "Nongkrong ramean vs me-time sendirian? 👥" (CHOICE) ---
  {
    id: 'r_p2_rame',
    dropId: 'poll_2',
    userName: 'Gilang Ramadhan',
    userId: 'user_gilang',
    isAnonymous: false,
    content: 'Ramean bareng temen 🎉',
    caption: 'ngakak bareng sampe subuh di warkop',
    createdAt: hoursAgo(17),
    reactions: [{ emoji: '🔥', count: 41, userIds: [] }]
  },
  {
    id: 'r_p2_metime',
    dropId: 'poll_2',
    userName: 'Zahra Khairunnisa',
    userId: 'user_zahra',
    isAnonymous: false,
    content: 'Me-time santai sendiri 🎧',
    caption: 'baca buku di cafe sendirian = ultimate peace of mind',
    createdAt: hoursAgo(16),
    reactions: [{ emoji: '❤️', count: 49, userIds: [] }]
  },

  // --- poll_3: "WFH vs WFO? 🏢" (CHOICE) ---
  {
    id: 'r_p3_wfh',
    dropId: 'poll_3',
    userName: 'Kevin Darmawan',
    userId: 'user_kevin',
    isAnonymous: false,
    content: 'WFH (Nyaman di Rumah) 🏠',
    caption: 'bebas macet, bisa masak sendiri, kerja pake kolor santai',
    createdAt: hoursAgo(19),
    reactions: [{ emoji: '🔥', count: 58, userIds: [] }]
  },
  {
    id: 'r_p3_wfo',
    dropId: 'poll_3',
    userName: 'Raka Pratama',
    userId: 'user_raka',
    isAnonymous: false,
    content: 'WFO (Fokus & Ganti Suasana) 💼',
    caption: 'lebih gampang koordinasi dan AC kantor dingin gratis haha',
    createdAt: hoursAgo(18),
    reactions: [{ emoji: '👍', count: 27, userIds: [] }]
  }
];

// Initial realistic Notifications
export const initialNotifications: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'user_minekaze',
    actorName: 'Raka Pratama',
    actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RakaPratama',
    type: 'RESPONSE',
    message: 'menjawab pertanyaan kamu',
    dropId: 'trend_1',
    dropSlug: 'lagi-makan-apa-hari-ini',
    dropPrompt: 'Lagi makan apa hari ini?',
    createdAt: minutesAgo(15),
    read: false,
    linkUrl: '/drop/lagi-makan-apa-hari-ini'
  },
  {
    id: 'notif_2',
    userId: 'user_minekaze',
    actorName: 'Salsa',
    actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SalsaJpg',
    type: 'COMMENT',
    message: 'mengirim obrolan di kiriman kamu',
    dropId: 'trend_2',
    dropSlug: 'show-meja-kerja-kalian',
    dropPrompt: 'Show meja kerja / belajar kalian dong 💻',
    createdAt: minutesAgo(45),
    read: false,
    linkUrl: '/drop/show-meja-kerja-kalian'
  },
  {
    id: 'notif_3',
    userId: 'user_minekaze',
    actorName: 'Dimas Raditya',
    actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DimasRaditya',
    type: 'REACTION',
    message: 'menyukai jawaban kamu',
    dropId: 'trend_7',
    dropSlug: 'kalian-kalau-ngopi-biasanya-habis-berapa',
    dropPrompt: 'Kalian kalau ngopi biasanya habis berapa sekali nongkrong? 💸',
    createdAt: hoursAgo(2),
    read: true,
    linkUrl: '/drop/kalian-kalau-ngopi-biasanya-habis-berapa'
  }
];
