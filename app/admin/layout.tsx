import AdminNavbar from '../../components/AdminNavbar';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
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
