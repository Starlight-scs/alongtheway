'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/rooms', label: 'Study Rooms', icon: '🏠' },
  { href: '/admin/requests', label: 'Requests', icon: '📝' },
  { href: '/admin/codes', label: 'Referral Codes', icon: '🎥' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8">
        <Link href="/" className="text-lg font-semibold text-charcoal">
          Prayer & Encouragement
        </Link>
        <p className="text-sm text-warm-gray">Admin Panel</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sage/10 text-sage font-medium'
                  : 'text-warm-gray hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-left text-warm-gray hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← Log out
        </button>
      </div>
    </aside>
  );
}
