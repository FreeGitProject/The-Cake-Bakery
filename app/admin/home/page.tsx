import { Metadata } from 'next';
import AdminHome from '@/features/admin/content/components/AdminHome';

export const metadata: Metadata = {
  title: 'Manage Home | Admin Dashboard',
  description: 'Manage the Home section of your Cake-Bakery Shop website',
};

export default function AdminHomePage() {
  return <AdminHome />;
}
