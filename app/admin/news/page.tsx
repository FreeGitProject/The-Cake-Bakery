import { Metadata } from 'next';
import AdminNews from '@/features/admin/content/components/AdminNews';

export const metadata: Metadata = {
  title: 'Manage News | Admin Dashboard',
  description: 'Manage the News section of your Cake-Bakery Shop website',
};

export default function AdminNewsPage() {
  return <AdminNews />;
}
