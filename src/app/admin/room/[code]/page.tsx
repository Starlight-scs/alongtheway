'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VideoRoom } from '@/components/video/VideoRoom';
import { Button } from '@/components/ui/Button';

export default function AdminRoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    async function createRoom() {
      try {
        const response = await fetch('/api/rooms/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessCode: code }),
        });

        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create room');
        }

        setRoomUrl(data.roomUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    createRoom();
  }, [code, router]);

  const handleJoin = () => {
    setJoined(true);
  };

  const handleLeave = () => {
    router.push('/admin/codes');
  };

  if (joined && roomUrl) {
    return (
      <div className="h-screen bg-charcoal flex items-center justify-center p-4">
        <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl">
          <VideoRoom roomUrl={roomUrl} userName="Mama & Papa" onLeave={handleLeave} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-sage border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-warm-gray">Setting up the meeting room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-error mb-4">{error}</p>
          <Button onClick={() => router.push('/admin/codes')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-charcoal mb-2">Ready to Start</h1>
          <p className="text-warm-gray">
            Session code: <span className="font-mono font-semibold">{code.toUpperCase()}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <div className="p-4 bg-linen rounded-lg">
              <p className="text-sm text-charcoal">
                <strong>Room link for participant:</strong>
              </p>
              <p className="text-sm font-mono text-sage break-all mt-1">
                {process.env.NEXT_PUBLIC_URL || window.location.origin}/room/{code.toLowerCase()}
              </p>
            </div>

            <Button onClick={handleJoin} className="w-full">
              Join as Mama & Papa
            </Button>

            <Button variant="secondary" onClick={handleLeave} className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
