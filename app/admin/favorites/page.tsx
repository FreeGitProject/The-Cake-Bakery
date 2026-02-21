import { Metadata } from 'next';
import AdminFavorites from '@/features/admin/content/components/AdminFavorites';

export const metadata: Metadata = {
  title: 'Manage Favorites | Admin Dashboard',
  description: 'Manage the Favorites section of your Cake-Bakery Shop website',
};

export default function AdminFavoritesPage() {
  return <AdminFavorites />;
}
