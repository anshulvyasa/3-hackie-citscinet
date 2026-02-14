/*
  # Create Observations Table for CitSciNet

  ## Overview
  Creates the observations table for the Citizen Science Platform with PostGIS support
  for geographic data.

  ## New Tables
    - `observations`
      - `id` (uuid, primary key) - Unique identifier for each observation
      - `created_at` (timestamptz) - Timestamp when observation was created
      - `updated_at` (timestamptz) - Timestamp when observation was last updated
      - `sighting_name` (text) - Name/title of the sighting
      - `category` (text) - Category: Water, Wildlife, Air, or Plants
      - `location` (geography) - Geographic point (latitude, longitude) using WGS84
      - `latitude` (numeric) - Latitude value for easy querying
      - `longitude` (numeric) - Longitude value for easy querying
      - `image_url` (text, nullable) - URL to uploaded image
      - `description` (text, nullable) - Optional description of the observation
      - `user_id` (uuid, nullable) - ID of user who created the observation

  ## Security
    - Enable RLS on observations table
    - Allow public read access (anyone can view observations)
    - Allow authenticated users to create observations
    - Allow users to update/delete their own observations

  ## Indexes
    - Spatial index on location for efficient geographic queries
    - Index on category for filtering
    - Index on created_at for sorting
*/

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create observations table
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
  description text,
  user_id uuid
);

-- Create indexes
CREATE INDEX IF NOT EXISTS observations_location_idx ON observations USING GIST (location);
CREATE INDEX IF NOT EXISTS observations_category_idx ON observations (category);
CREATE INDEX IF NOT EXISTS observations_created_at_idx ON observations (created_at DESC);
CREATE INDEX IF NOT EXISTS observations_user_id_idx ON observations (user_id);

-- Enable Row Level Security
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view observations (public read access)
CREATE POLICY "Anyone can view observations"
  ON observations
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can create observations
CREATE POLICY "Authenticated users can create observations"
  ON observations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can update their own observations
CREATE POLICY "Users can update own observations"
  ON observations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own observations
CREATE POLICY "Users can delete own observations"
  ON observations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_observations_updated_at
  BEFORE UPDATE ON observations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();