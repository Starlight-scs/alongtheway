import crypto from 'crypto';
import { createDailyRoom } from '@/lib/daily';
import { generateAccessCode, normalizeCode } from '@/lib/codes';
import { supabaseAdmin } from '@/lib/supabase';

export function slugifyStudyRoomTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export async function generateUniqueStudyRoomSlug(title: string): Promise<string> {
  const baseSlug = slugifyStudyRoomTitle(title) || 'bible-study-room';

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = attempt === 0 ? '' : `-${crypto.randomBytes(2).toString('hex')}`;
    const slug = `${baseSlug}${suffix}`;

    const { data } = await supabaseAdmin
      .from('study_rooms')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) {
      return slug;
    }
  }

  return `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
}

export async function generateUniqueRoomAccessCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateAccessCode(6);
    const { data } = await supabaseAdmin
      .from('study_rooms')
      .select('id')
      .eq('access_code', code)
      .maybeSingle();

    if (!data) {
      return code;
    }
  }

  throw new Error('Failed to generate a unique room access code');
}

export async function getActiveRoomSession(roomId: string) {
  const { data, error } = await supabaseAdmin
    .from('room_sessions')
    .select('*')
    .eq('room_id', roomId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createRoomSession(room: { id: string; slug: string }) {
  const dailyRoomName = `study-${room.slug}-${Date.now().toString(36)}`;
  const dailyRoom = await createDailyRoom({
    name: dailyRoomName,
    expiryMinutes: 180,
    maxParticipants: 25,
  });

  const { data, error } = await supabaseAdmin
    .from('room_sessions')
    .insert({
      room_id: room.id,
      daily_room_name: dailyRoom.name,
      daily_room_url: dailyRoom.url,
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getOrCreateRoomSession(room: { id: string; slug: string }) {
  const activeSession = await getActiveRoomSession(room.id);
  if (activeSession) {
    return activeSession;
  }

  return createRoomSession(room);
}

export function normalizeRoomAccessCode(code: string): string {
  return normalizeCode(code);
}
