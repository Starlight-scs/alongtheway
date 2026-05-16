import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await isAdminAuthenticated();

  // Don't redirect on login page
  const isLoginPage = false; // This will be handled by the page itself

  if (!isAuth && !isLoginPage) {
    // Check if this is the login page by checking the URL
    // For now, we'll handle this differently
  }

  // If not authenticated and not on login page, the API will return 401
  // and the client will redirect

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuth ? (
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
