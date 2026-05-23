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
  daily_room_name TEXT,
  daily_room_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- admins: Simple admin auth
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- study_rooms: Host-created Bible study rooms
CREATE TABLE IF NOT EXISTS study_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  access_code TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  is_recurring BOOLEAN DEFAULT false,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  host_admin_id UUID REFERENCES admins(id)
);

-- room_sessions: Live Daily.co sessions for a study room
CREATE TABLE IF NOT EXISTS room_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  daily_room_name TEXT UNIQUE NOT NULL,
  daily_room_url TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended'))
);

-- room_invites: Shareable invite links for a study room
CREATE TABLE IF NOT EXISTS room_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  invite_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0
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
CREATE INDEX IF NOT EXISTS idx_study_rooms_slug ON study_rooms(slug);
CREATE INDEX IF NOT EXISTS idx_study_rooms_status ON study_rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_sessions_room_id ON room_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_room_sessions_status ON room_sessions(status);
CREATE INDEX IF NOT EXISTS idx_room_invites_room_id ON room_invites(room_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_invites ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Service role full access to study_rooms"
  ON study_rooms
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to room_sessions"
  ON room_sessions
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to room_invites"
  ON room_invites
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

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_study_rooms_updated_at ON study_rooms;
CREATE TRIGGER trg_study_rooms_updated_at
  BEFORE UPDATE ON study_rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert a test admin
-- INSERT INTO admins (email, password_hash)
-- VALUES ('admin@example.com', 'REPLACE_WITH_BCRYPT_HASH');
