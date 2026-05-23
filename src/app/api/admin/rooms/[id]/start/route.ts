import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getOrCreateRoomSession } from '@/lib/studyRooms';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const { data: room, error } = await supabaseAdmin
      .from('study_rooms')
      .select('id, slug, title, status, access_code')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const session = await getOrCreateRoomSession(room);

    return NextResponse.json({
      room: {
        id: room.id,
        title: room.title,
        slug: room.slug,
        accessCode: room.access_code,
      },
      session,
    });
  } catch (error) {
    console.error('Error starting room session:', error);
    return NextResponse.json(
      { error: 'Failed to start room session' },
      { status: 500 }
    );
  }
}
