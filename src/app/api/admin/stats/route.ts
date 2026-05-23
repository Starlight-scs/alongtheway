import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get counts
    const [requestsResult, activeCodesResult, studyRoomsResult, roomSessionsResult] = await Promise.all([
      supabaseAdmin.from('requests').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('access_codes').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('study_rooms').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('room_sessions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

    return NextResponse.json({
      totalRequests: requestsResult.count || 0,
      activeCodes: activeCodesResult.count || 0,
      activeStudyRooms: studyRoomsResult.count || 0,
      activeRoomSessions: roomSessionsResult.count || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
