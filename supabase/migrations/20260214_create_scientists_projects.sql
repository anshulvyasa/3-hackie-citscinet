/*
  # Create Scientists and Projects Tables

  ## Overview
  Creates tables for scientist profiles and their projects.

  ## New Tables
    - `scientists`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Scientist name
      - `role` (text) - Role/title (e.g., "Lead Researcher", "Field Scientist")
      - `description` (text) - Bio/description about the scientist
      - `avatar_url` (text, nullable) - Profile picture URL
      - `email` (text) - Contact email
      - `user_id` (uuid, nullable) - Link to auth user
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `projects`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Project name
      - `description` (text) - Project description
      - `scientist_id` (uuid, foreign key) - Link to scientist
      - `status` (text) - Status: active, completed, archived
      - `image_url` (text, nullable) - Project image
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  ## Security
    - Enable RLS on both tables
    - Allow public read access
    - Allow authenticated users to manage their own data
*/

-- Create scientists table
CREATE TABLE IF NOT EXISTS public.scientists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  email TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  scientist_id UUID NOT NULL REFERENCES public.scientists(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scientists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for scientists table
CREATE POLICY "Scientists are readable by everyone" ON public.scientists
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own scientist profile" ON public.scientists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create scientist profiles" ON public.scientists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for projects table
CREATE POLICY "Projects are readable by everyone" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own projects" ON public.projects
  FOR UPDATE USING (
    scientist_id IN (
      SELECT id FROM public.scientists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create projects" ON public.projects
  FOR INSERT WITH CHECK (
    scientist_id IN (
      SELECT id FROM public.scientists WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_scientist_id ON public.projects(scientist_id);
CREATE INDEX IF NOT EXISTS idx_scientists_user_id ON public.scientists(user_id);
