import CreateCake from '@/features/admin/cakes/components/CreateCake';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Cakes | Admin Dashboard',
  description: 'Create the cakes in your The Cake Shop',
};

export default function AdminCreateCakePage() {
  return <CreateCake />;
}
