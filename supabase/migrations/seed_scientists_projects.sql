-- Seed sample scientist and projects
-- Replace Cloudinary cloud name in URLs if needed (dzskqbz8I)

-- This inserts one scientist and two projects linked to that scientist.
-- Run this in Supabase SQL Editor. The query returns the inserted scientist id.

WITH s AS (
  INSERT INTO public.scientists (id, name, role, description, avatar_url, email, user_id)
  VALUES (
    gen_random_uuid(),
    'Dr. Jane Doe',
    'Lead Researcher',
    'Dr. Jane Doe is an expert in wetland ecology and leads long-term biodiversity monitoring projects.',
    'https://res.cloudinary.com/dzskqbz8I/image/upload/v1/sample_avatar.jpg',
    'jane.doe@example.com',
    NULL
  )
  RETURNING id
)
INSERT INTO public.projects (id, name, description, scientist_id, status, image_url)
SELECT
  gen_random_uuid(),
  'Amazon Rainforest Survey',
  'A comprehensive study of biodiversity across multiple sites in the Amazon.',
  s.id,
  'active',
  'https://res.cloudinary.com/dzskqbz8I/image/upload/v1/sample_project1.jpg'
FROM s;

-- Insert a second project for the same scientist
WITH s2 AS (
  SELECT id FROM public.scientists WHERE email = 'jane.doe@example.com' LIMIT 1
)
INSERT INTO public.projects (id, name, description, scientist_id, status, image_url)
SELECT
  gen_random_uuid(),
  'Coastal Wetlands Monitoring',
  'Long-term monitoring of bird and plant communities in coastal wetlands.',
  s2.id,
  'active',
  'https://res.cloudinary.com/dzskqbz8I/image/upload/v1/sample_project2.jpg'
FROM s2;

-- To retrieve the scientist id you can run:
-- SELECT id FROM public.scientists WHERE email = 'jane.doe@example.com';
