'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { VideoRoom } from '@/components/video/VideoRoom';

interface StartRoomResponse {
  room: {
    id: string;
    title: string;
    slug: string;
    accessCode: string;
  };
  session: {
    id: string;
    daily_room_url: string;
    status: 'active' | 'ended';
  };
}

export default function AdminStudyRoomPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const roomId = params.id;

  const [payload, setPayload] = useState<StartRoomResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    async function startRoom() {
      try {
        const response = await fetch(`/api/admin/rooms/${roomId}/start`, {
          method: 'POST',
        });

        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to open room');
        }

        setPayload(data);
      } catch (startError) {
        setError(startError instanceof Error ? startError.message : 'Failed to open room');
      } finally {
        setLoading(false);
      }
    }

    if (roomId) {
      startRoom();
    }
  }, [roomId, router]);

  if (joined && payload?.session?.daily_room_url) {
    return (
      <div className="h-screen bg-charcoal flex items-center justify-center p-4">
        <div className="w-full h-[75vh] max-w-[133vh] rounded-xl overflow-hidden shadow-2xl">
          <VideoRoom
            roomUrl={payload.session.daily_room_url}
            userName="Mama & Papa"
            onLeave={() => router.push('/admin/rooms')}
            isHost={true}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-warm-gray">Preparing the room...</p>
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-error">{error || 'Room not found'}</p>
          <Button type="button" variant="secondary" onClick={() => router.push('/admin/rooms')}>
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  const joinLink = `${typeof window === 'undefined' ? '' : window.location.origin}/join/${payload.room.slug}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-charcoal">{payload.room.title}</h1>
          <p className="mt-2 text-warm-gray">
            Share the link and access code below, then join when you are ready to host.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-linen p-4">
            <p className="text-sm font-medium text-charcoal">Invite link</p>
            <p className="mt-1 break-all font-mono text-sm text-sage">{joinLink}</p>
          </div>
          <div className="rounded-xl bg-linen p-4">
            <p className="text-sm font-medium text-charcoal">Access code</p>
            <p className="mt-1 font-mono text-lg text-sage">{payload.room.accessCode}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" className="sm:flex-1" onClick={() => setJoined(true)}>
            Join as Host
          </Button>
          <Button type="button" variant="secondary" className="sm:flex-1" onClick={() => router.push('/admin/rooms')}>
            Back to Rooms
          </Button>
        </div>
      </div>
    </div>
  );
}
