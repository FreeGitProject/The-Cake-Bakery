import { Metadata } from 'next';
import AllCakes from '@/features/cakes/components/AllCakes';

export const metadata: Metadata = {
  title: 'All Pastries | The Cake Shop',
  description: 'Browse our delicious selection of pastries',
};

export default function PastriesPage() {
  return <AllCakes caketype="pastries" />;
}
