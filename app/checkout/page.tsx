// app/checkout/page.tsx
import { Metadata } from 'next';
import CheckoutForm from '../components/CheckoutForm';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Checkout | The Cake Shop',
  description: 'Complete your order from The Cake Shop',
};

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-text mb-8">Checkout</h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
