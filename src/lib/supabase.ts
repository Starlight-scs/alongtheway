import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let _supabaseAdmin: SupabaseClient | null = null;
let _supabase: SupabaseClient | null = null;

// Server-side client with service role key (full access)
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new Error('Supabase URL and Service Key are required. Check your environment variables.');
    }

    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Client-side client with anon key (limited access)
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase URL and Anon Key are required. Check your environment variables.');
    }

    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Backwards compatibility - lazy getter
export const supabaseAdmin = {
  from: (table: string) => getSupabaseAdmin().from(table),
};

// Database types
export interface Request {
  id: string;
  created_at: string;
  referrer_name: string;
  referrer_email: string;
  referrer_relationship: string;
  person_first_name: string;
  person_email: string | null;
  person_phone: string | null;
  situation: string;
  prayer_requests: string;
  notes_for_ministers: string | null;
  how_heard: string | null;
}

export interface AccessCode {
  id: string;
  request_id: string;
  code: string;
  created_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface Booking {
  id: string;
  access_code_id: string | null;
  cal_booking_id: string;
  scheduled_at: string;
  attendee_email: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  created_at: string;
}

export interface StudyRoom {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  slug: string;
  access_code: string;
  status: 'active' | 'archived';
  is_recurring: boolean;
  starts_at: string | null;
  ends_at: string | null;
  host_admin_id: string | null;
}

export interface RoomSession {
  id: string;
  room_id: string;
  created_at: string;
  started_at: string;
  ended_at: string | null;
  daily_room_name: string;
  daily_room_url: string;
  status: 'active' | 'ended';
}

export interface RoomInvite {
  id: string;
  room_id: string;
  created_at: string;
  invite_token: string;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
}
