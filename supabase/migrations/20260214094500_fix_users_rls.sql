-- Fix RLS policies for users table - remove TO public restriction
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Allow insert for anyone" ON users;

-- Create more permissive policies
CREATE POLICY "Allow insert for anyone"
ON users
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow select for anyone"
ON users
FOR SELECT
USING (true);

CREATE POLICY "Allow update for anyone"
ON users
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for anyone"
ON users
FOR DELETE
USING (true);
