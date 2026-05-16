import { NextResponse } from 'next/server';
import { createDailyRoom, getDailyRoom, generateRoomName } from '@/lib/daily';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCode } from '@/lib/codes';

export async function POST(request: Request) {
  try {
    const { accessCode } = await request.json();

    if (!accessCode) {
      return NextResponse.json(
        { error: 'Access code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = normalizeCode(accessCode);

    // Verify the access code exists and is valid
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('access_codes')
      .select('id, status, expires_at')
      .eq('code', normalizedCode)
      .single();

    if (codeError || !codeData) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 400 }
      );
    }

    if (codeData.status !== 'active') {
      return NextResponse.json(
        { error: 'This access code is no longer active' },
        { status: 400 }
      );
    }

    // Generate room name from access code
    const roomName = generateRoomName(normalizedCode);

    // Check if room already exists
    let room = await getDailyRoom(roomName);

    if (!room) {
      // Create a new room (expires in 2 hours)
      room = await createDailyRoom({
        name: roomName,
        expiryMinutes: 120,
        maxParticipants: 4,
      });
    }

    return NextResponse.json({
      roomUrl: room.url,
      roomName: room.name,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting room' },
      { status: 500 }
    );
  }
}
