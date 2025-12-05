-- Marketing Consents Table Setup (SAFE VERSION)
-- Run this SQL in your Supabase SQL Editor
-- This version checks if things exist before creating them

-- Create marketing_consents table (only if not exists)
CREATE TABLE IF NOT EXISTS marketing_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMP DEFAULT NOW(),
  iubenda_consent_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for fast lookups (only if not exists)
CREATE INDEX IF NOT EXISTS idx_marketing_consents_user_id ON marketing_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_consents_email ON marketing_consents(email);
CREATE INDEX IF NOT EXISTS idx_marketing_consents_consent ON marketing_consents(consent_given, unsubscribed_at);

-- Enable Row Level Security
ALTER TABLE marketing_consents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view their own consent" ON marketing_consents;
DROP POLICY IF EXISTS "Users can insert their own consent" ON marketing_consents;
DROP POLICY IF EXISTS "Users can update their own consent" ON marketing_consents;

-- Create RLS Policies
CREATE POLICY "Users can view their own consent"
  ON marketing_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent"
  ON marketing_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consent"
  ON marketing_consents FOR UPDATE
  USING (auth.uid() = user_id);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_marketing_consents_updated_at ON marketing_consents;

CREATE TRIGGER update_marketing_consents_updated_at BEFORE UPDATE
    ON marketing_consents FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON marketing_consents TO authenticated;
GRANT ALL ON marketing_consents TO service_role;

-- Verify setup
SELECT 'Setup completed successfully!' as status;
