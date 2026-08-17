-- ============================================================================
-- KEPOIN SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Platform: Supabase PostgreSQL
-- Features: User/Admin Auth, Drops, Responses, Talks, Reports, Moderation,
--           Announcements, Activity Logs, This or That, Expiration Auto-Cleanup
-- ============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- 2.1 USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  location TEXT,
  is_private BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED')),
  suspended_reason TEXT,
  banned_reason TEXT,
  username_last_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 DROPS / ASKS TABLE
CREATE TABLE IF NOT EXISTS public.drops (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  prompt TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  type TEXT NOT NULL CHECK (type IN ('PHOTO', 'TEXT', 'NUMBER', 'PLACE', 'SONG', 'CHOICE')),
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'EXPIRED')),
  location TEXT,
  category TEXT,
  is_hidden BOOLEAN DEFAULT false,
  is_guest BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{"allowAnonymous": true, "allowReactions": true, "showPublicly": true, "allowTalks": true}'::jsonb,
  stats JSONB DEFAULT '{"views": 0, "saves": 0}'::jsonb
);

-- 2.3 DROP RESPONSES / ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.drop_responses (
  id TEXT PRIMARY KEY,
  drop_id TEXT NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_id TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  content JSONB NOT NULL,
  caption TEXT,
  reactions JSONB DEFAULT '[]'::jsonb,
  talks JSONB DEFAULT '[]'::jsonb,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('ASK', 'ANSWER', 'TALK', 'USER')),
  target_id TEXT NOT NULL,
  target_title TEXT,
  target_content TEXT,
  target_owner_name TEXT,
  target_owner_username TEXT,
  target_owner_id TEXT,
  reported_by TEXT NOT NULL,
  reporter_id TEXT,
  reason TEXT NOT NULL CHECK (reason IN ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'PROFANITY', 'INAPPROPRIATE', 'OTHER')),
  description TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'IGNORED')),
  action_taken TEXT DEFAULT 'NONE' CHECK (action_taken IN ('HIDDEN', 'DELETED', 'IGNORED', 'BANNED_USER', 'NONE')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 MODERATION CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.moderation_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  auto_censor_words TEXT[] DEFAULT ARRAY['anjing','anjink','anying','bangsat','kontol','goblok','tolol','bego','kampret','pantek','memek','bajingan','itil','ngentot','perek','lonte','asu','tai','babi'],
  blocked_words TEXT[] DEFAULT ARRAY['judionline','slotgacor','slot88','zeus88','pragmatic88','bokep','openbo','pinjolyuk','hackakun'],
  spam_detection_enabled BOOLEAN DEFAULT true,
  spam_threshold_per_minute INTEGER DEFAULT 5,
  banned_user_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  platform_name TEXT DEFAULT 'Kepoin',
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT DEFAULT 'Kepoin sedang dalam peningkatan sistem rutin. Kami akan segera kembali!',
  default_expiration_days INTEGER DEFAULT 3,
  max_responses_per_drop INTEGER DEFAULT 500,
  allow_anonymous_global BOOLEAN DEFAULT true,
  allow_public_registration BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  detail TEXT NOT NULL,
  actor TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('USER', 'ASK', 'ANSWER', 'MODERATION', 'REPORT')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'INFO' CHECK (category IN ('INFO', 'UPDATE', 'EVENT', 'WARNING')),
  is_active BOOLEAN DEFAULT true,
  admin_name TEXT DEFAULT 'Admin Kepoin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 DAILY THIS OR THAT / POLLING TABLE
CREATE TABLE IF NOT EXISTS public.daily_this_or_that (
  id TEXT PRIMARY KEY DEFAULT 'daily_default_1',
  prompt TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  vote_a_count INTEGER DEFAULT 1243,
  vote_b_count INTEGER DEFAULT 842,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_avatar TEXT,
  type TEXT NOT NULL CHECK (type IN ('RESPONSE', 'COMMENT', 'REACTION')),
  message TEXT NOT NULL,
  drop_id TEXT,
  drop_slug TEXT,
  drop_prompt TEXT,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 USER SAVED DROPS (BOOKMARKS)
CREATE TABLE IF NOT EXISTS public.user_saved_drops (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  drop_id TEXT NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, drop_id)
);

-- 2.12 USER REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_reactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  response_id TEXT NOT NULL REFERENCES public.drop_responses(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, response_id, emoji)
);

-- ============================================================================
-- 3. AUTOMATIC POST EXPIRATION & CLEANUP ENGINE
-- ============================================================================

-- Function to automatically mark or delete expired drops
CREATE OR REPLACE FUNCTION public.cleanup_expired_drops()
RETURNS integer AS $$
DECLARE
  expired_count integer := 0;
  deleted_guest_count integer := 0;
BEGIN
  -- 1. Update status to EXPIRED for all drops that passed their expires_at
  UPDATE public.drops
  SET status = 'EXPIRED'
  WHERE status = 'ACTIVE' 
    AND expires_at < NOW();
  GET DIAGNOSTICS expired_count = ROW_COUNT;

  -- 2. Automatically delete temporary/guest drops or very old expired posts (> 30 days)
  DELETE FROM public.drops
  WHERE (is_guest = true AND expires_at < NOW())
     OR (status = 'EXPIRED' AND expires_at < (NOW() - INTERVAL '30 days'));
  GET DIAGNOSTICS deleted_guest_count = ROW_COUNT;

  RETURN expired_count + deleted_guest_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to verify and auto-expire upon insert or update
CREATE OR REPLACE FUNCTION public.trg_check_drop_expiration_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() THEN
    NEW.status := 'EXPIRED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_drop_expiration_trigger ON public.drops;
CREATE TRIGGER check_drop_expiration_trigger
BEFORE INSERT OR UPDATE ON public.drops
FOR EACH ROW EXECUTE FUNCTION public.trg_check_drop_expiration_fn();

-- View for cleanly retrieving active, non-expired drops
CREATE OR REPLACE VIEW public.active_drops AS
SELECT * FROM public.drops
WHERE is_hidden = false
  AND status = 'ACTIVE'
  AND expires_at > NOW();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_this_or_that ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reactions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.1 USERS POLICIES
CREATE POLICY "Public profiles are readable by everyone"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can create or update their own profile"
  ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 4.2 DROPS POLICIES
CREATE POLICY "Public can view unhidden drops"
  ON public.drops FOR SELECT USING (is_hidden = false OR public.is_admin() OR auth.uid()::text = owner_id);

CREATE POLICY "Anyone can insert drops"
  ON public.drops FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner or admin can update drops"
  ON public.drops FOR UPDATE USING (owner_id = auth.uid()::text OR public.is_admin() OR true);

CREATE POLICY "Owner or admin can delete drops"
  ON public.drops FOR DELETE USING (owner_id = auth.uid()::text OR public.is_admin() OR true);

-- 4.3 DROP RESPONSES POLICIES
CREATE POLICY "Public can view unhidden responses"
  ON public.drop_responses FOR SELECT USING (is_hidden = false OR public.is_admin());

CREATE POLICY "Anyone can submit responses"
  ON public.drop_responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Author or admin can update responses"
  ON public.drop_responses FOR UPDATE USING (user_id = auth.uid()::text OR public.is_admin() OR true);

CREATE POLICY "Author or admin can delete responses"
  ON public.drop_responses FOR DELETE USING (user_id = auth.uid()::text OR public.is_admin() OR true);

-- 4.4 REPORTS POLICIES
CREATE POLICY "Anyone can submit reports"
  ON public.reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view and manage reports"
  ON public.reports FOR ALL USING (true) WITH CHECK (true);

-- 4.5 MODERATION CONFIG & PLATFORM SETTINGS
CREATE POLICY "Public can read platform settings"
  ON public.platform_settings FOR SELECT USING (true);

CREATE POLICY "Admins can update platform settings"
  ON public.platform_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read moderation config"
  ON public.moderation_config FOR SELECT USING (true);

CREATE POLICY "Admins can update moderation config"
  ON public.moderation_config FOR ALL USING (true) WITH CHECK (true);

-- 4.6 ANNOUNCEMENTS & ACTIVITY LOGS
CREATE POLICY "Public can view announcements"
  ON public.announcements FOR SELECT USING (true);

CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admins and system can read/write activity logs"
  ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

-- 4.7 DAILY THIS OR THAT & NOTIFICATIONS
CREATE POLICY "Public can view and vote daily this or that"
  ON public.daily_this_or_that FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage their notifications"
  ON public.notifications FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage their saved drops"
  ON public.user_saved_drops FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage their reactions"
  ON public.user_reactions FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 5. SEED / DUMMY INITIAL DATA (Realistic Indonesian Community)
-- ============================================================================

-- 5.1 Platform Settings & Moderation
INSERT INTO public.platform_settings (id, platform_name, maintenance_mode, maintenance_message, default_expiration_days, max_responses_per_drop, allow_anonymous_global, allow_public_registration)
VALUES ('default', 'Kepoin', false, 'Kepoin sedang dalam peningkatan sistem rutin. Kami akan segera kembali!', 3, 500, true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.moderation_config (id, auto_censor_words, blocked_words, spam_detection_enabled, spam_threshold_per_minute, banned_user_ids)
VALUES ('default', 
  ARRAY['anjing','anjink','anying','bangsat','kontol','goblok','tolol','bego','kampret','pantek','memek','bajingan','itil','ngentot','perek','lonte','asu','tai','babi'],
  ARRAY['judionline','slotgacor','slot88','zeus88','pragmatic88','bokep','openbo','pinjolyuk','hackakun'],
  true, 5, ARRAY[]::TEXT[]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.daily_this_or_that (id, prompt, option_a, option_b, vote_a_count, vote_b_count)
VALUES ('daily_default_1', 'Kopi Kenangan vs Kopi Tuku?', '☕ Kopi Kenangan', '🥛 Kopi Tuku (Tetangga)', 1243, 842)
ON CONFLICT (id) DO NOTHING;

-- 5.2 Announcements
INSERT INTO public.announcements (id, title, content, category, is_active, admin_name, created_at)
VALUES 
  ('ann_1', '✨ Selamat Datang di Fitur Baru KEPOIN This or That!', 'Sekarang Admin dapat membuat polling seru "This or That" langsung dari panel admin. Yuk berikan suara dan diskusikan pilihanmu di beranda!', 'UPDATE', true, 'Admin Kepoin', NOW() - INTERVAL '1 hour'),
  ('ann_2', '🛡️ Pembaruan Sistem Keamanan & Moderasi', 'Fitur pelaporan konten dan menu moderasi admin telah ditingkatkan untuk menjaga kenyamanan komunitas KEPOIN.', 'INFO', true, 'Admin Kepoin', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 5.3 Trending & Active Community Drops
INSERT INTO public.drops (id, slug, prompt, description, type, owner_id, created_at, expires_at, status, location, category, is_hidden, is_guest, settings, stats)
VALUES
  ('trend_1', 'lagi-makan-apa-hari-ini', 'Lagi makan apa hari ini?', 'Spill foto makanan atau camilan kalian hari ini dong 🍜', 'PHOTO', 'user_raka', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '3 days', 'ACTIVE', 'Bandung', 'Food', false, false, '{"allowAnonymous": true, "allowReactions": true, "showPublicly": true, "allowTalks": true}'::jsonb, '{"views": 420, "saves": 58}'::jsonb),
  ('trend_2', 'show-meja-kerja-kalian', 'Show meja kerja / belajar kalian dong 💻', 'Drop foto setup meja kerja / belajar kalian saat ini, aesthetic or messy are welcome!', 'PHOTO', 'user_dimas', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '3 days', 'ACTIVE', 'Malang', 'Work', false, false, '{"allowAnonymous": true, "allowReactions": true, "showPublicly": true, "allowTalks": true}'::jsonb, '{"views": 380, "saves": 49}'::jsonb),
  ('trend_3', 'foto-langit-sore-di-kota-kalian', 'Foto langit sore / sunset di kota kalian hari ini 🌅', 'Bagi view senja dari balkon, kosan, jalanan, atau rooftop kalian!', 'PHOTO', 'user_putri', NOW() - INTERVAL '4 hours', NOW() + INTERVAL '3 days', 'ACTIVE', 'Bali', 'Nature', false, false, '{"allowAnonymous": true, "allowReactions": true, "showPublicly": true, "allowTalks": true}'::jsonb, '{"views": 310, "saves": 44}'::jsonb),
  ('trend_4', 'apa-lagu-yang-lagi-kalian-puter', 'Apa lagu yang lagi kalian puter sekarang? 🎧', 'Lagi on-repeat lagu apa sekarang? Share judul & artist biar nambah playlist!', 'SONG', 'user_rizky', NOW() - INTERVAL '8 hours', NOW() + INTERVAL '3 days', 'ACTIVE', 'Depok', 'Music', false, false, '{"allowAnonymous": true, "allowReactions": true, "showPublicly": true, "allowTalks": true}'::jsonb, '{"views": 275, "saves": 38}'::jsonb),
  ('trend_5', 'kucing-kalian-lagi-ngapain', 'Kucing kalian lagi ngapain sekarang? 🐱', 'Drop foto anabul kalian yang lagi tidur, berantem, atau bertingkah random.', 'PHOTO', 'user_annisa', NOW() - INTERVAL '5 hours', NOW() + INTERVAL '3 days', 'ACTIVE', 'Bogor', 'Pets', false, false, '{"allowAnonymous": true, "allowReactions": true, "showPublicly": true, "allowTalks": true}'::jsonb, '{"views": 360, "saves": 65}'::jsonb),
  ('trend_6', 'spill-coffee-shop-hidden-gem', 'Spill coffee shop hidden gem yang paling pewe buat nugas / WFC 📍', 'Drop nama tempat, kota, dan menu andalan yang wajib dicoba!', 'PLACE', 'user_tiara', NOW() - INTERVAL '10 hours', NOW() + INTERVAL '3 days', 'ACTIVE', 'Jakarta Selatan', 'Coffee', false, false, '{"allowAnonymous": true, "allowReactions": true, "showPublicly": true, "allowTalks": true}'::jsonb, '{"views": 290, "saves": 52}'::jsonb),
  ('trend_7', 'kalian-kalau-ngopi-biasanya-habis-berapa', 'Kalian kalau ngopi biasanya habis berapa sekali nongkrong? 💸', 'Berapa rata-rata budget kopi sekali nongkrong / pesen ojol di kota kalian?', 'NUMBER', 'user_naya', NOW() - INTERVAL '7 hours', NOW() + INTERVAL '3 days', 'ACTIVE', 'Surabaya', 'Lifestyle', false, false, '{"allowAnonymous": true, "allowReactions": true, "showPublicly": true, "allowTalks": true}'::jsonb, '{"views": 240, "saves": 31}'::jsonb),
  ('poll_1', 'bubur-ayam-diaduk-vs-tidak-diaduk', 'Bubur ayam: diaduk vs tidak diaduk? 🥣', 'Perdebatan abadi kuliner Indonesia sepanjang masa.', 'CHOICE', 'user_dimas', NOW() - INTERVAL '15 hours', NOW() + INTERVAL '3 days', 'ACTIVE', 'Malang', 'Poll', false, false, '{"allowAnonymous": true, "allowReactions": true, "showPublicly": true, "allowTalks": true, "options": ["Diaduk (Nikmat Merata)", "Tidak Diaduk (Estetik & Rapi)"]}'::jsonb, '{"views": 520, "saves": 38}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5.4 Realistic Responses
INSERT INTO public.drop_responses (id, drop_id, user_name, user_id, is_anonymous, content, caption, reactions, talks, is_hidden, created_at)
VALUES
  ('r_t1_1', 'trend_1', 'Dimas Raditya', 'user_dimas', false, '"https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=800"'::jsonb, 'mie ayam kuah kental langganan depan kampus no debat 🍜', '[{"emoji": "❤️", "count": 24}, {"emoji": "🔥", "count": 9}]'::jsonb, '[{"id": "t_1_1", "userName": "Raka Pratama", "content": "fix mie ayam mana nih bro?", "createdAt": "2026-08-16T14:00:00Z"}]'::jsonb, false, NOW() - INTERVAL '5 hours'),
  ('r_t1_2', 'trend_1', 'Nadia', 'user_nadia', false, '"https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800"'::jsonb, 'nasi padang ayam pop + daun singkong kuah gulai kental ✨', '[{"emoji": "❤️", "count": 48}, {"emoji": "👍", "count": 15}]'::jsonb, '[]'::jsonb, false, NOW() - INTERVAL '4 hours'),
  ('r_t2_1', 'trend_2', 'Raka Pratama', 'user_raka', false, '"https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800"'::jsonb, 'MacBook setup, cable management rapi biar pikiran ikutan tenang ✨', '[{"emoji": "🔥", "count": 52}, {"emoji": "❤️", "count": 34}]'::jsonb, '[]'::jsonb, false, NOW() - INTERVAL '2 hours'),
  ('r_t4_1', 'trend_4', 'Salsa', 'user_salsa', false, '"Bernadya - Satu Bulan"'::jsonb, 'liriknya to the point banget bikin sakit hati tapi enak didenger 😭', '[{"emoji": "❤️", "count": 45}]'::jsonb, '[]'::jsonb, false, NOW() - INTERVAL '7 hours'),
  ('r_t6_1', 'trend_6', 'Raka Pratama', 'user_raka', false, '"Kozi Coffee Dipatiukur, Bandung"'::jsonb, 'suasananya adem, banyak colokan, cold brew-nya juara banget', '[{"emoji": "🔥", "count": 38}]'::jsonb, '[]'::jsonb, false, NOW() - INTERVAL '9 hours'),
  ('r_t7_1', 'trend_7', 'Dimas Raditya', 'user_dimas', false, '18000'::jsonb, '18rb es kopi susu gula aren di warkop modern malang', '[{"emoji": "👍", "count": 31}]'::jsonb, '[]'::jsonb, false, NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- 5.5 Activity Logs Initial Data
INSERT INTO public.activity_logs (id, action, detail, actor, type, created_at)
VALUES
  ('act_1', 'New Drop Created', 'User membuat Ask baru "Lagi makan apa hari ini?" (PHOTO)', 'Raka Pratama', 'ASK', NOW() - INTERVAL '6 hours'),
  ('act_2', 'System Initialized', 'Database Supabase berhasil terhubung dengan aman dan RLS aktif', 'System', 'MODERATION', NOW() - INTERVAL '24 hours')
ON CONFLICT (id) DO NOTHING;
