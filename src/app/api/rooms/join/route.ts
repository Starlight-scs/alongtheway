import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getOrCreateRoomSession, normalizeRoomAccessCode } from '@/lib/studyRooms';
import { joinStudyRoomSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = joinStudyRoomSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json({ error: issue?.message || 'Invalid request' }, { status: 400 });
    }

    const normalizedCode = normalizeRoomAccessCode(parsed.data.accessCode);

    const { data: room, error } = await supabaseAdmin
      .from('study_rooms')
      .select('id, title, slug, access_code, status')
      .eq('slug', parsed.data.slug)
      .eq('status', 'active')
      .single();

    if (error || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.access_code !== normalizedCode) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 400 });
    }

    const session = await getOrCreateRoomSession(room);

    return NextResponse.json({
      room: {
        id: room.id,
        title: room.title,
        slug: room.slug,
      },
      session,
    });
  } catch (error) {
    console.error('Error joining study room:', error);
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}
