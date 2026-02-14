/*
  # Create User Authentication Table

  ## Overview
  Creates the users table with username/password authentication and user type enum.

  ## Enum
    - user_type: 'normal' (citizen scientist) or 'scientist' (professional researcher)

  ## Table
    - `id` (uuid, primary key)
    - `username` (text, unique, required)
    - `password` (text, required) - will be hashed
    - `type` (user_type enum, default: 'normal')
    - `created_at` (timestamptz, auto-generated)
*/

-- Create enum type
CREATE TYPE user_type AS ENUM ('normal', 'scientist');

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    type user_type NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow insert for anyone"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
