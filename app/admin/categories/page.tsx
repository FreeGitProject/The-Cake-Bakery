import { Metadata } from 'next';
import AdminCategories from '@/features/admin/cakes/components/AdminCategories';

export const metadata: Metadata = {
  title: 'Manage Categories | Admin Dashboard',
  description: 'Manage the cake categories in your Cake-Bakery Shop',
};

export default function AdminCategoriesPage() {
  return <AdminCategories />;
}
