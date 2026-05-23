'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VideoRoom } from '@/components/video/VideoRoom';

interface PublicRoom {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  is_recurring: boolean;
  starts_at: string | null;
}

interface JoinResponse {
  room: {
    id: string;
    title: string;
    slug: string;
  };
  session: {
    daily_room_url: string;
  };
}

export default function JoinStudyRoomPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinPayload, setJoinPayload] = useState<JoinResponse | null>(null);

  useEffect(() => {
    async function fetchRoom() {
      try {
        const response = await fetch(`/api/rooms/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Room not found');
        }

        setRoom(data.data);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Room not found');
      } finally {
        setLoadingRoom(false);
      }
    }

    if (slug) {
      fetchRoom();
    }
  }, [slug]);

  async function handleJoin() {
    setJoining(true);
    setError(null);

    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name,
          accessCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join room');
      }

      setJoinPayload(data);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Failed to join room');
    } finally {
      setJoining(false);
    }
  }

  if (joinPayload?.session.daily_room_url) {
    return (
      <div className="h-screen bg-charcoal flex items-center justify-center p-4">
        <div className="w-full h-[75vh] max-w-[133vh] rounded-xl overflow-hidden shadow-2xl">
          <VideoRoom
            roomUrl={joinPayload.session.daily_room_url}
            userName={name}
            onLeave={() => router.push('/')}
          />
        </div>
      </div>
    );
  }

  if (loadingRoom) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-warm-gray">Loading room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-semibold text-charcoal">Room not found</h1>
          <p className="mt-3 text-warm-gray">{error || 'This room may have been removed.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-charcoal">{room.title}</h1>
          {room.description ? (
            <p className="mt-3 text-warm-gray">{room.description}</p>
          ) : (
            <p className="mt-3 text-warm-gray">
              Enter your name and the access code you received from the host.
            </p>
          )}
          {room.starts_at ? (
            <p className="mt-3 text-sm text-warm-gray">
              Scheduled for {new Date(room.starts_at).toLocaleString()}
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          <Input
            label="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your first name"
            required
          />
          <Input
            label="Access code"
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
            placeholder="Enter the room code"
            required
          />

          {error ? <p className="text-sm text-error">{error}</p> : null}

          <Button
            type="button"
            isLoading={joining}
            className="w-full"
            onClick={handleJoin}
          >
            Join Room
          </Button>
        </div>
      </div>
    </div>
  );
}
