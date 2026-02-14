-- Reset observations (safe: drops any partial objects)
DROP TABLE IF EXISTS observations CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Ensure PostGIS is enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create observations table (no user_id)
CREATE TABLE IF NOT EXISTS observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  sighting_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Water', 'Wildlife', 'Air', 'Plants')),
  location geography(Point, 4326) NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  image_url text,
  description text
);

-- Indexes
CREATE INDEX IF NOT EXISTS observations_location_idx 
  ON observations USING GIST (location);

CREATE INDEX IF NOT EXISTS observations_category_idx 
  ON observations (category);

CREATE INDEX IF NOT EXISTS observations_created_at_idx 
  ON observations (created_at DESC);

-- Enable RLS
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

-- Public policies (correct syntax)
CREATE POLICY "Anyone can view observations"
  ON observations
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert observations"
  ON observations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update observations"
  ON observations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete observations"
  ON observations
  FOR DELETE
  USING (true);

-- updated_at trigger function + trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_observations_updated_at
  BEFORE UPDATE ON observations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
