import { Metadata } from 'next';
import AdminFooter from '@/features/admin/content/components/AdminFooter';

export const metadata: Metadata = {
  title: 'Manage Footer | Admin Dashboard',
  description: 'Manage the Footer section of your Cake-Bakery Shop website',
};

export default function AdminFooterPage() {
  return <AdminFooter />;
}
