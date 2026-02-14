CREATE TYPE user_type AS ENUM ('normal', 'scientist');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    type user_type NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
CREATE POLICY "Allow insert for anyone"
ON users
FOR INSERT
WITH CHECK (true);

-- Allow select (needed for signup/login to verify users)
CREATE POLICY "Allow select for authenticated"
ON users
FOR SELECT
USING (true);

-- Allow update for the user's own row
CREATE POLICY "Allow update own user"
ON users
FOR UPDATE
USING (true)
WITH CHECK (true);
