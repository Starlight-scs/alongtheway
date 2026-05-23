import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import {
  generateUniqueRoomAccessCode,
  generateUniqueStudyRoomSlug,
} from '@/lib/studyRooms';
import { studyRoomSchema } from '@/lib/validations';

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('study_rooms')
      .select(`
        *,
        room_sessions (
          id,
          started_at,
          ended_at,
          status,
          daily_room_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching study rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = studyRoomSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json({ error: issue?.message || 'Invalid room data' }, { status: 400 });
    }

    const slug = await generateUniqueStudyRoomSlug(parsed.data.title);
    const accessCode = await generateUniqueRoomAccessCode();
    const startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt).toISOString() : null;

    const { data, error } = await supabaseAdmin
      .from('study_rooms')
      .insert({
        title: parsed.data.title.trim(),
        description: parsed.data.description?.trim() || null,
        slug,
        access_code: accessCode,
        status: 'active',
        is_recurring: Boolean(parsed.data.isRecurring),
        starts_at: startsAt,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating study room:', error);
    return NextResponse.json(
      { error: 'Failed to create study room' },
      { status: 500 }
    );
  }
}
