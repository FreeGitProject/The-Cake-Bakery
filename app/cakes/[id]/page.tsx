import { Metadata } from 'next';
import CakeDetails from '@/features/cakes/components/CakeDetails';

export const metadata: Metadata = {
  title: 'Cake Details | Cake-Bakery Shop',
  description: 'View details of our delicious cakes',
};

export default function CakeDetailsPage({ params }: { params: { id: string } }) {
  return <CakeDetails id={params.id} />;
}
