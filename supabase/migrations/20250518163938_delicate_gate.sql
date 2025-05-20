/*
  # Create gallery table

  1. New Tables
    - `gallery`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `image_url` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `gallery` table
    - Add policy for authenticated users to manage gallery
    - Add policy for public to view gallery
*/

CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to view gallery"
  ON gallery
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage gallery"
  ON gallery
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);