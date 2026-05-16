'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';

interface Booking {
  id: string;
  cal_booking_id: string;
  scheduled_at: string;
  attendee_email: string;
  status: string;
  created_at: string;
  access_codes: {
    code: string;
    requests: {
      person_first_name: string;
    };
  } | null;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch('/api/admin/bookings');
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        const data = await response.json();
        setBookings(data.data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      case 'no_show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-warm-gray">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-charcoal mb-6">Bookings</h1>

      {bookings.length === 0 ? (
        <Card className="bg-white">
          <p className="text-warm-gray">No bookings yet.</p>
          <p className="text-sm text-warm-gray mt-2">
            Bookings will appear here when people book sessions through Cal.com.
            Make sure the Cal.com webhook is configured to sync bookings.
          </p>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Date & Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Person</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Code Used</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-charcoal">
                    {formatDate(booking.scheduled_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-charcoal">
                    {booking.access_codes?.requests?.person_first_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-warm-gray">{booking.attendee_email}</td>
                  <td className="px-4 py-3 font-mono text-sm text-warm-gray">
                    {booking.access_codes?.code || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
