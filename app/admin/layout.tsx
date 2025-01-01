"use client";
import AdminNavbar from '../../components/AdminNavbar';
import { useSessionContext } from '../../context/SessionContext';
import { redirect } from 'next/navigation';

export default  function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useSessionContext();
  console.log('Provided credentials admin:', session); 
  if (loading) return <p>Loading...</p>;
  console.log('Provided credentials admin:', session); // Log the session
 
    if (!session || session.user.role !== 'admin') {
    redirect('/login'); // Redirect to login if no session or user is not an admin
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="p-4">{children}</main>
    </div>
  );
}
