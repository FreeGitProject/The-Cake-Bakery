'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from '@/shared/components/ui/toaster';
import AdminNavbar from '@/shared/components/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    // Only redirect when we are certain the user is NOT an admin
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    if (session && session.user?.role !== 'admin') {
      router.replace('/');
    }
  }, [session, status, router]);

  // Show loading spinner while session is being determined
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Unauthenticated — wait for the redirect effect
  if (status === 'unauthenticated') {
    return null;
  }

  // Session exists but role not yet populated — keep showing spinner
  if (!session?.user?.role) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Confirmed non-admin — wait for the redirect effect
  if (session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="p-4 py-20">{children}</main>
      <Toaster />
    </div>
  );
}
