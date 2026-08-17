-- ==============================================================================
-- KEPOIN - SCRIPT SQL PEMBUATAN AKUN ADMINISTRATOR SUPABASE
-- ==============================================================================
-- Jalankan skrip ini langsung di Supabase SQL Editor (Dashboard Supabase > SQL Editor).
-- Skrip ini akan membuat akun Admin di auth.users (Supabase Auth) dan public.profiles.
-- ==============================================================================

-- 1. Pastikan ekstensi pgcrypto aktif untuk hashing password
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Pastikan tabel public.profiles ada
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

-- Aktifkan RLS pada tabel profiles jika belum
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (true);
  END IF;
END $$;

-- 3. Variabel & Konfigurasi Akun Admin:
-- Email    : admin@kepoin.app
-- Username : @admin
-- Password : AdminKepoin2026!
-- Role     : ADMIN

DO $$
DECLARE
  new_admin_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
  admin_email TEXT := 'admin@kepoin.app';
  admin_pass TEXT := 'AdminKepoin2026!';
  encrypted_pass TEXT;
BEGIN
  -- Hash password dengan blowfish (bcrypt) standar Supabase Auth
  encrypted_pass := crypt(admin_pass, gen_salt('bf', 10));

  -- 2.1 Masukkan / Perbarui ke tabel auth.users
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token
    )
    VALUES (
      new_admin_id,
      '00000000-0000-0000-0000-000000000000'::UUID,
      admin_email,
      encrypted_pass,
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Super Administrator", "username": "@admin", "role": "ADMIN"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    )
    ON CONFLICT (id) DO UPDATE SET
      encrypted_password = encrypted_pass,
      raw_user_meta_data = '{"name": "Super Administrator", "username": "@admin", "role": "ADMIN"}'::jsonb,
      updated_at = NOW();

    -- Tambahkan identitas auth.identities jika diperlukan
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities') THEN
      -- Hapus identitas lama jika sudah ada untuk admin ini
      DELETE FROM auth.identities WHERE user_id = new_admin_id;

      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      )
      VALUES (
        new_admin_id,
        new_admin_id,
        format('{"sub":"%s","email":"%s"}', new_admin_id, admin_email)::jsonb,
        'email',
        new_admin_id::text,
        NOW(),
        NOW(),
        NOW()
      );
    END IF;
  END IF;

  -- 2.2 Masukkan / Perbarui ke tabel public.profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    INSERT INTO public.profiles (
      id,
      name,
      username,
      avatar,
      bio,
      role,
      status,
      created_at,
      updated_at
    )
    VALUES (
      new_admin_id::TEXT,
      'Super Administrator',
      '@admin',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminKepoinMaster',
      'Kepoin System Administrator & Content Moderator.',
      'ADMIN',
      'ACTIVE',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'ADMIN',
      status = 'ACTIVE',
      name = 'Super Administrator',
      username = '@admin',
      updated_at = NOW();
  END IF;

  -- 2.3 Jika ada tabel public.users (kompatibilitas ganda)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    INSERT INTO public.users (
      id,
      name,
      username,
      email,
      avatar,
      bio,
      role,
      status,
      created_at,
      updated_at
    )
    VALUES (
      new_admin_id::TEXT,
      'Super Administrator',
      '@admin',
      admin_email,
      'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminKepoinMaster',
      'Kepoin System Administrator & Content Moderator.',
      'ADMIN',
      'ACTIVE',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'ADMIN',
      status = 'ACTIVE',
      name = 'Super Administrator',
      username = '@admin',
      email = admin_email,
      updated_at = NOW();
  END IF;

END $$;

-- 3. Verifikasi Akun Admin yang baru dibuat
SELECT id, name, username, role, status FROM public.profiles WHERE role = 'ADMIN';
