'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';

interface Stats {
  totalRequests: number;
  activeCodes: number;
  activeStudyRooms: number;
  activeRoomSessions: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-warm-gray">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-sans text-xl font-medium tracking-normal text-charcoal">Overview</h1>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-warm-gray">Requests</p>
          <p className="text-2xl font-semibold text-charcoal">{stats?.totalRequests || 0}</p>
        </Card>
        <Card className="bg-white">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-warm-gray">Codes</p>
          <p className="text-2xl font-semibold text-charcoal">{stats?.activeCodes || 0}</p>
        </Card>
        <Card className="bg-white">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-warm-gray">Study Rooms</p>
          <p className="text-2xl font-semibold text-charcoal">{stats?.activeStudyRooms || 0}</p>
        </Card>
        <Card className="bg-white">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-warm-gray">Live Sessions</p>
          <p className="text-2xl font-semibold text-charcoal">{stats?.activeRoomSessions || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
          <h2 className="mb-4 font-sans text-base font-medium tracking-normal text-charcoal">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/admin/rooms" className="text-sage hover:underline">
                Create and host study rooms →
              </Link>
            </li>
            <li>
              <Link href="/admin/requests" className="text-sage hover:underline">
                View all requests →
              </Link>
            </li>
            <li>
              <Link href="/admin/codes" className="text-sage hover:underline">
                Manage referral access codes →
              </Link>
            </li>
            <li>
              <Link href="/admin/bookings" className="text-sage hover:underline">
                View bookings →
              </Link>
            </li>
          </ul>
        </Card>

        <Card className="bg-white">
          <h2 className="mb-4 font-sans text-base font-medium tracking-normal text-charcoal">External Links</h2>
          <ul className="space-y-2">
            <li>
              <a
                href="https://cal.com/starlight-creative-studios-avhwm0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage hover:underline"
              >
                Cal.com Dashboard →
              </a>
            </li>
            <li>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage hover:underline"
              >
                Supabase Dashboard →
              </a>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
