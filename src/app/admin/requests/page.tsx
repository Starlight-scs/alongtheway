'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';

interface Request {
  id: string;
  created_at: string;
  referrer_name: string;
  referrer_email: string;
  referrer_relationship: string;
  person_first_name: string;
  person_email: string | null;
  person_phone: string | null;
  situation: string;
  prayer_requests: string;
  notes_for_ministers: string | null;
  how_heard: string | null;
  access_codes: {
    id: string;
    code: string;
    status: string;
    expires_at: string;
  }[];
}

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/admin/requests');
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        const data = await response.json();
        setRequests(data.data || []);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
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
      <h1 className="text-2xl font-semibold text-charcoal mb-6">Requests</h1>

      {requests.length === 0 ? (
        <Card className="bg-white">
          <p className="text-warm-gray">No requests yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="bg-white">
              <div
                className="cursor-pointer"
                onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-charcoal">
                      {request.person_first_name}
                    </h3>
                    <p className="text-sm text-warm-gray">
                      Referred by {request.referrer_name} ({request.referrer_relationship})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-warm-gray">{formatDate(request.created_at)}</p>
                    {request.access_codes?.[0] && (
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                          request.access_codes[0].status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : request.access_codes[0].status === 'expired'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.access_codes[0].status}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-warm-gray mt-2 line-clamp-2">
                  {request.situation}
                </p>
              </div>

              {expandedId === request.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-charcoal">Contact Info</h4>
                    <p className="text-sm text-warm-gray">
                      Email: {request.referrer_email}
                      {request.person_email && <> | Person: {request.person_email}</>}
                      {request.person_phone && <> | Phone: {request.person_phone}</>}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-charcoal">Situation</h4>
                    <p className="text-sm text-warm-gray whitespace-pre-wrap">{request.situation}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-charcoal">Prayer Requests</h4>
                    <p className="text-sm text-warm-gray whitespace-pre-wrap">{request.prayer_requests}</p>
                  </div>

                  {request.notes_for_ministers && (
                    <div>
                      <h4 className="text-sm font-medium text-charcoal">Notes for Ministers</h4>
                      <p className="text-sm text-warm-gray whitespace-pre-wrap">
                        {request.notes_for_ministers}
                      </p>
                    </div>
                  )}

                  {request.access_codes?.[0] && (
                    <div>
                      <h4 className="text-sm font-medium text-charcoal">Access Code</h4>
                      <p className="text-sm font-mono text-charcoal">
                        {request.access_codes[0].code}
                      </p>
                      <p className="text-xs text-warm-gray">
                        Expires: {formatDate(request.access_codes[0].expires_at)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
