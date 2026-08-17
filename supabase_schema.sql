-- ==============================================================================
-- KEPOIN SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================
-- URL: https://iugdyjtohhimtqwmyqxn.supabase.co
-- Fitur: Drops/Pertanyaan, Tanggapan/Answers, Obrolan/Talks, Reaksi, Notifikasi,
--        Pengguna, Laporan, Admin Moderasi, & Auto-Expiration Trigger (3 Hari).
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ==============================================================================
-- 2. TABLES DEFINITIONS
-- ==============================================================================

-- 2.1 USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT,
    bio TEXT DEFAULT 'Suka kepo & berbagi momen seru di Kepoin.',
    role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BANNED', 'SUSPENDED')),
    username_last_changed_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 DROPS / PERTANYAAN TABLE
CREATE TABLE IF NOT EXISTS public.drops (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    prompt TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('PHOTO', 'NUMBER', 'CHOICE', 'SONG', 'PLACE', 'TEXT')),
    cover_image TEXT,
    category TEXT DEFAULT 'LIFESTYLE',
    owner_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'EXPIRED', 'ARCHIVED')),
    reactions JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{"allowAnonymous": true, "allowMultipleDrops": true, "allowTalks": true, "durationDays": 3}'::jsonb,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 RESPONSES / JAWABAN TABLE
CREATE TABLE IF NOT EXISTS public.responses (
    id TEXT PRIMARY KEY,
    drop_id TEXT REFERENCES public.drops(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    content JSONB NOT NULL,
    caption TEXT,
    reactions JSONB DEFAULT '[]'::jsonb,
    talks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_name TEXT NOT NULL,
    actor_avatar TEXT,
    type TEXT NOT NULL,
    priority TEXT DEFAULT 'INFO' CHECK (priority IN ('HIGH', 'MEDIUM', 'INFO')),
    emoji TEXT,
    actor_count INTEGER DEFAULT 1,
    message TEXT NOT NULL,
    drop_id TEXT,
    drop_slug TEXT,
    drop_prompt TEXT,
    response_id TEXT,
    talk_id TEXT,
    link_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 USER SAVED DROPS TABLE
CREATE TABLE IF NOT EXISTS public.saved_drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    drop_id TEXT NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, drop_id)
);

-- 2.6 USER REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('DROP', 'RESPONSE')),
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, emoji)
);

-- 2.7 REPORTS / LAPORAN TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL CHECK (target_type IN ('ASK', 'ANSWER', 'USER')),
    target_id TEXT NOT NULL,
    target_title TEXT,
    target_content TEXT,
    target_owner_name TEXT,
    target_owner_username TEXT,
    target_owner_id TEXT,
    reason TEXT NOT NULL,
    additional_notes TEXT,
    reporter_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name TEXT NOT NULL,
    reporter_email TEXT,
    reporter_avatar TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'DISMISSED', 'RESOLVED')),
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3.1 PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (true);

-- 3.2 DROPS POLICIES
CREATE POLICY "Drops are viewable by everyone" 
ON public.drops FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert drops" 
ON public.drops FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners and admins can update drops" 
ON public.drops FOR UPDATE USING (true);

CREATE POLICY "Owners and admins can delete drops" 
ON public.drops FOR DELETE USING (true);

-- 3.3 RESPONSES POLICIES
CREATE POLICY "Responses are viewable by everyone" 
ON public.responses FOR SELECT USING (true);

CREATE POLICY "Everyone can insert responses" 
ON public.responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners and admins can update responses" 
ON public.responses FOR UPDATE USING (true);

CREATE POLICY "Owners and admins can delete responses" 
ON public.responses FOR DELETE USING (true);

-- 3.4 NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT USING (true);

CREATE POLICY "System and users can insert notifications" 
ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update/mark read their notifications" 
ON public.notifications FOR UPDATE USING (true);

CREATE POLICY "Users can delete their notifications" 
ON public.notifications FOR DELETE USING (true);

-- 3.5 SAVED DROPS POLICIES
CREATE POLICY "Users can view and manage their saved drops" 
ON public.saved_drops FOR ALL USING (true);

-- 3.6 USER REACTIONS POLICIES
CREATE POLICY "Users can view and manage reactions" 
ON public.user_reactions FOR ALL USING (true);

-- 3.7 REPORTS POLICIES
CREATE POLICY "Users can submit reports" 
ON public.reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view and manage reports" 
ON public.reports FOR ALL USING (true);

-- ==============================================================================
-- 4. AUTOMATED EXPIRATION CRON / FUNCTION (3-Day Limit)
-- ==============================================================================

-- Function to mark expired drops and clean up expired posts
CREATE OR REPLACE FUNCTION public.handle_expired_drops()
RETURNS void AS $$
BEGIN
    -- Update status drops that have passed 3 days / expires_at
    UPDATE public.drops
    SET status = 'EXPIRED',
        updated_at = NOW()
    WHERE expires_at <= NOW()
      AND status = 'ACTIVE';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cron job to run every hour (if pg_cron is enabled in Supabase)
-- SELECT cron.schedule('check_expired_drops_hourly', '0 * * * *', 'SELECT public.handle_expired_drops();');

-- ==============================================================================
-- 5. DUMMY DATA SEED
-- ==============================================================================

-- 5.1 Insert Profiles (Including Super Admin)
INSERT INTO public.profiles (id, name, username, avatar, bio, role, status)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Super Administrator', '@admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminKepoinMaster', 'Kepoin System Administrator & Content Moderator.', 'ADMIN', 'ACTIVE'),
  ('user_dimas', 'Dimas Arya', '@dimasarya', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dimas', 'Fotografer & pencinta kopi.', 'USER', 'ACTIVE'),
  ('user_sinta', 'Sinta Bella', '@sintabella', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sinta', 'Music enthusiast & foodie!', 'USER', 'ACTIVE'),
  ('user_fajar', 'Fajar Ramadhan', '@fajar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fajar', 'UI Designer from Bandung.', 'USER', 'ACTIVE'),
  ('user_raka', 'Raka Pratama', '@raka', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raka', 'Exploring Jakarta night life.', 'USER', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status;

-- 5.2 Insert Active Drops (3 Days active window)
INSERT INTO public.drops (id, slug, prompt, description, type, cover_image, category, owner_id, owner_name, status, reactions, expires_at, created_at)
VALUES
  (
    'drop_1',
    'foto-langit-sore-ini',
    'Share foto langit sore ini dari tempatmu! 🌅',
    'Lagi golden hour nih, drop foto langit terbaikmu tanpa filter.',
    'PHOTO',
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200&auto=format&fit=crop&q=80',
    'LIFESTYLE',
    'user_dimas',
    'Dimas Arya',
    'ACTIVE',
    '[{"emoji": "❤️", "count": 12, "userIds": []}, {"emoji": "🔥", "count": 8, "userIds": []}]'::jsonb,
    NOW() + INTERVAL '2 days 18 hours',
    NOW() - INTERVAL '6 hours'
  ),
  (
    'drop_2',
    'lagu-pengantar-tidur',
    'Lagu apa yang wajib diputar sebelum tidur? 🎵',
    'Rekomendasikan lagu lo-fi atau acoustic paling tenang.',
    'SONG',
    NULL,
    'ENTERTAINMENT',
    'user_sinta',
    'Sinta Bella',
    'ACTIVE',
    '[{"emoji": "❤️", "count": 15, "userIds": []}, {"emoji": "👍", "count": 6, "userIds": []}]'::jsonb,
    NOW() + INTERVAL '2 days 10 hours',
    NOW() - INTERVAL '14 hours'
  ),
  (
    'drop_3',
    'tempat-ngopi-pw-jaksel',
    'Tempat ngopi paling PW di Jaksel buat WFC? ☕',
    'Drop nama cafe dan kotanya yang ada colokan dan wifi kenceng.',
    'PLACE',
    NULL,
    'LIFESTYLE',
    'user_fajar',
    'Fajar Ramadhan',
    'ACTIVE',
    '[{"emoji": "🔥", "count": 9, "userIds": []}, {"emoji": "👀", "count": 7, "userIds": []}]'::jsonb,
    NOW() + INTERVAL '1 day 20 hours',
    NOW() - INTERVAL '1 day 4 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- 5.3 Insert Responses
INSERT INTO public.responses (id, drop_id, user_id, user_name, is_anonymous, content, caption, reactions, talks, created_at)
VALUES
  (
    'resp_1',
    'drop_1',
    'user_sinta',
    'Sinta Bella',
    false,
    '"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"'::jsonb,
    'Pantai waktu sunset kemarin di Bali 😍',
    '[{"emoji": "❤️", "count": 7, "userIds": []}, {"emoji": "🔥", "count": 4, "userIds": []}]'::jsonb,
    '[{"id": "talk_1", "userName": "Dimas Arya", "content": "Keren banget warnanya!", "createdAt": "2026-08-16T10:00:00Z"}]'::jsonb,
    NOW() - INTERVAL '4 hours'
  ),
  (
    'resp_2',
    'drop_2',
    'user_raka',
    'Raka Pratama',
    false,
    '{"title": "Sparks", "artist": "Coldplay"}'::jsonb,
    'Gak pernah bosen denger lagu ini pas mau tidur.',
    '[{"emoji": "❤️", "count": 9, "userIds": []}]'::jsonb,
    '[]'::jsonb,
    NOW() - INTERVAL '8 hours'
  )
ON CONFLICT (id) DO NOTHING;
