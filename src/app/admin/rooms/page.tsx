'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface StudyRoomRecord {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  access_code: string;
  status: 'active' | 'archived';
  is_recurring: boolean;
  starts_at: string | null;
  created_at: string;
  room_sessions?: Array<{
    id: string;
    status: 'active' | 'ended';
    started_at: string;
    daily_room_url: string;
  }>;
}

export default function AdminRoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<StudyRoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startsAt: '',
    isRecurring: false,
  });

  useEffect(() => {
    let active = true;

    async function loadRooms() {
      try {
        const response = await fetch('/api/admin/rooms');
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }

        const data = await response.json();
        if (!active) {
          return;
        }

        setRooms(data.data || []);
      } catch (fetchError) {
        console.error('Error fetching study rooms:', fetchError);
        if (active) {
          setError('Unable to load study rooms right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRooms();

    return () => {
      active = false;
    };
  }, [router]);

  async function fetchRooms() {
    const response = await fetch('/api/admin/rooms');
    if (response.status === 401) {
      router.push('/admin/login');
      return;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load study rooms');
    }

    setRooms(data.data || []);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create room');
      }

      setForm({
        title: '',
        description: '',
        startsAt: '',
        isRecurring: false,
      });
      await fetchRooms();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  }

  async function copyInvite(slug: string, accessCode: string) {
    const baseUrl = window.location.origin;
    const inviteText = `${baseUrl}/join/${slug}\nAccess code: ${accessCode}`;
    await navigator.clipboard.writeText(inviteText);
    setCopyState(slug);
    window.setTimeout(() => setCopyState(null), 1500);
  }

  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at))),
    [rooms]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-warm-gray">Loading study rooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">Study Rooms</h1>
        <p className="mt-2 max-w-2xl text-warm-gray">
          Create a room once, share the link and code, and start the live session only when it is time to host.
        </p>
      </div>

      <Card className="bg-white">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Room title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Tuesday evening Bible study"
              required
            />
            <Input
              label="Start time"
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
              helperText="Optional. Used for planning and context."
            />
          </div>

          <Textarea
            label="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="What this room is for, who it is for, and what they can expect."
          />

          <label className="flex items-center gap-3 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(event) => setForm((current) => ({ ...current, isRecurring: event.target.checked }))}
            />
            This is a recurring room.
          </label>

          {error ? <p className="text-sm text-error">{error}</p> : null}

          <Button type="submit" isLoading={submitting}>
            Create Room
          </Button>
        </form>
      </Card>

      <div className="grid gap-5">
        {sortedRooms.length === 0 ? (
          <Card className="bg-white">
            <p className="text-warm-gray">No study rooms created yet.</p>
          </Card>
        ) : (
          sortedRooms.map((room) => {
            const activeSession = room.room_sessions?.find((session) => session.status === 'active');
            const sharePath = `/join/${room.slug}`;
            const shareLink = typeof window === 'undefined' ? sharePath : `${window.location.origin}${sharePath}`;

            return (
              <Card key={room.id} className="bg-white">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-xl font-semibold text-charcoal">{room.title}</h2>
                      {room.description ? (
                        <p className="mt-2 max-w-2xl text-warm-gray">{room.description}</p>
                      ) : null}
                    </div>

                    <div className="grid gap-3 text-sm text-charcoal md:grid-cols-2">
                      <div>
                        <p className="font-medium">Invite link</p>
                        <p className="font-mono text-sage break-all">{shareLink}</p>
                      </div>
                      <div>
                        <p className="font-medium">Access code</p>
                        <p className="font-mono text-sage">{room.access_code}</p>
                      </div>
                      <div>
                        <p className="font-medium">Schedule</p>
                        <p>{room.starts_at ? new Date(room.starts_at).toLocaleString() : 'Open room'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Status</p>
                        <p>{activeSession ? 'Live session ready' : 'Waiting to start'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:w-56">
                    <Button type="button" onClick={() => router.push(`/admin/rooms/${room.id}`)}>
                      Host Room
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => copyInvite(room.slug, room.access_code)}
                    >
                      {copyState === room.slug ? 'Copied Invite' : 'Copy Invite'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
