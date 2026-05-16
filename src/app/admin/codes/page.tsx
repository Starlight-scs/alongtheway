'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AccessCode {
  id: string;
  code: string;
  status: string;
  created_at: string;
  expires_at: string;
  requests: {
    id: string;
    referrer_name: string;
    person_first_name: string;
  };
}

export default function AdminCodesPage() {
  const router = useRouter();
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetchCodes();
  }, [router]);

  async function fetchCodes() {
    try {
      const response = await fetch('/api/admin/codes');
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setCodes(data.data || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this code? This cannot be undone.')) {
      return;
    }

    setRevoking(id);
    try {
      const response = await fetch(`/api/admin/codes/${id}/revoke`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchCodes();
      }
    } catch (error) {
      console.error('Error revoking code:', error);
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredCodes = codes.filter((code) => {
    if (filter === 'all') return true;
    return code.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-warm-gray">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-charcoal">Access Codes</h1>

        <div className="flex gap-2">
          {(['all', 'active', 'expired', 'revoked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === f
                  ? 'bg-sage text-white'
                  : 'bg-gray-100 text-warm-gray hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredCodes.length === 0 ? (
        <Card className="bg-white">
          <p className="text-warm-gray">No codes found.</p>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">For</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Referred By</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Expires</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-warm-gray">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCodes.map((code) => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm text-charcoal">{code.code}</td>
                  <td className="px-4 py-3 text-sm text-charcoal">
                    {code.requests?.person_first_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-warm-gray">
                    {code.requests?.referrer_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-warm-gray">{formatDate(code.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-warm-gray">{formatDate(code.expires_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        code.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : code.status === 'expired'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {code.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {code.status === 'active' && (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => router.push(`/admin/room/${code.code.toLowerCase()}`)}
                          className="text-sm px-3 py-1"
                        >
                          Start Session
                        </Button>
                        <Button
                          variant="text"
                          onClick={() => handleRevoke(code.id)}
                          disabled={revoking === code.id}
                          className="text-sm text-error"
                        >
                          {revoking === code.id ? 'Revoking...' : 'Revoke'}
                        </Button>
                      </>
                    )}
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
