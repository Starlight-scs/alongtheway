-- Mama & Papa Prayer Platform - Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- requests: Intake form submissions
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  referrer_name TEXT NOT NULL,
  referrer_email TEXT NOT NULL,
  referrer_relationship TEXT NOT NULL,
  person_first_name TEXT NOT NULL,
  person_email TEXT,
  person_phone TEXT,
  situation TEXT NOT NULL,
  prayer_requests TEXT NOT NULL,
  notes_for_ministers TEXT,
  how_heard TEXT
);

-- access_codes: Generated codes for booking access
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked'))
);

-- bookings: Synced from Cal.com webhooks
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_code_id UUID REFERENCES access_codes(id),
  cal_booking_id TEXT UNIQUE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  attendee_email TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- admins: Simple admin auth
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_status ON access_codes(status);
CREATE INDEX IF NOT EXISTS idx_access_codes_expires ON access_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by the API)
-- Note: These policies allow the service_role key to do everything
-- The anon key should NOT be able to read/write directly

CREATE POLICY "Service role full access to requests"
  ON requests
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to access_codes"
  ON access_codes
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to bookings"
  ON bookings
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to admins"
  ON admins
  USING (true)
  WITH CHECK (true);

-- ============================================
-- OPTIONAL: Auto-expire codes function
-- ============================================

-- Function to auto-expire old codes (can be called via cron)
CREATE OR REPLACE FUNCTION expire_old_codes()
RETURNS void AS $$
BEGIN
  UPDATE access_codes
  SET status = 'expired'
  WHERE expires_at < NOW()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert a test admin
-- INSERT INTO admins (email, password_hash)
-- VALUES ('admin@example.com', 'REPLACE_WITH_BCRYPT_HASH');
