/*
  # Create Users Profile Table

  ## Overview
  Creates a users profile table to store user information including username, email, password, and user type.

  ## New Table
    - `user_profiles`
      - `id` (uuid, primary key) - Unique identifier / linked to auth user
      - `username` (text) - Display username
      - `email` (text) - User email
      - `password_hash` (text) - Hashed password (for additional security layer)
      - `user_type` (text) - Type: 'citizen_scientist' or 'professional_researcher'
      - `avatar_url` (text, nullable) - Profile picture URL
      - `bio` (text, nullable) - Short biography
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  ## Security
    - Enable RLS
    - Users can only read/update their own profile
    - Public read access disabled for security
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('citizen_scientist', 'professional_researcher')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
