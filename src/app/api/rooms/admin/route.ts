import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { createDailyRoom, getDailyRoom, generateRoomName } from '@/lib/daily';

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { accessCode } = await request.json();

    if (!accessCode) {
      return NextResponse.json(
        { error: 'Access code is required' },
        { status: 400 }
      );
    }

    const roomName = generateRoomName(accessCode);

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
    console.error('Error creating admin room:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting room' },
      { status: 500 }
    );
  }
}
