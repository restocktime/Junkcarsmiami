-- Junk Car Miami - Leads Database Setup
-- Run this in Supabase SQL Editor

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle TEXT,
  year TEXT,
  make TEXT,
  model TEXT,
  vin TEXT,
  condition TEXT,
  has_title TEXT,
  damage TEXT,
  location TEXT,
  zip TEXT,
  comments TEXT,
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'high',
  source TEXT DEFAULT 'Website Form',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
-- (You can make this more restrictive later)
DROP POLICY IF EXISTS "Allow all operations" ON leads;
CREATE POLICY "Allow all operations" ON leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample lead for testing
INSERT INTO leads (name, phone, email, vehicle, year, make, model, location, status, priority, source)
VALUES (
  'Test Customer',
  '(305) 555-1234',
  'test@example.com',
  '2015 Honda Civic',
  '2015',
  'Honda',
  'Civic',
  'Miami',
  'new',
  'high',
  'Database Setup'
);

-- Verify table was created
SELECT COUNT(*) as total_leads FROM leads;
