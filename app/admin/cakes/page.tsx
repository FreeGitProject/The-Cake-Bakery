import AdminCakes from '@/features/admin/cakes/components/AdminCakes';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Cakes | Admin Dashboard',
  description: 'Manage the cakes in your Cake-Bakery Shop',
};

export default function AdminCakesPage() {
  return <AdminCakes />;
}
