'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VideoRoom } from '@/components/video/VideoRoom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join room');
      }

      setRoomUrl(data.roomUrl);
      setJoined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = () => {
    setJoined(false);
    setRoomUrl(null);
    router.push('/confirmation');
  };

  if (joined && roomUrl) {
    return (
      <div className="h-screen bg-cream relative">
        <VideoRoom roomUrl={roomUrl} userName={name} onLeave={handleLeave} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-charcoal mb-2">Join Your Session</h1>
          <p className="text-warm-gray">
            Enter your name to join the meeting room with Mama and Papa.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <Input
              label="Your name"
              placeholder="Enter your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error || undefined}
              autoFocus
            />

            <Button
              onClick={handleJoin}
              isLoading={loading}
              className="w-full"
            >
              Join Session
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-charcoal mb-2">Before you join:</h3>
            <ul className="text-sm text-warm-gray space-y-1">
              <li>• Make sure you&apos;re in a quiet, private space</li>
              <li>• Check that your camera and microphone work</li>
              <li>• Take a deep breath — you&apos;re in good hands</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-warm-gray mt-6">
          Session code: <span className="font-mono">{code.toUpperCase()}</span>
        </p>
      </div>
    </div>
  );
}
