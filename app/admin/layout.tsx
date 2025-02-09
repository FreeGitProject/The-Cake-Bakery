"use client";
import { Toaster } from '@/components/ui/toaster';
import AdminNavbar from '../../components/AdminNavbar';

export default  function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="p-4 py-20">{children}</main>
      <Toaster />
    </div>
  );
}
