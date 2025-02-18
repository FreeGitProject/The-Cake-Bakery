// app/checkout/page.tsx
import { Metadata } from 'next';
import CheckoutForm from '../components/CheckoutForm';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Import your auth options if needed
//import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Checkout | The Cake Shop',
  description: 'Complete your order from The Cake Shop',
};

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  // // Fetch cart data from cookies (since `useCart` cannot be used on the server)
  // const cartCookie = cookies().get('cart');
  // const cart = cartCookie ? JSON.parse(cartCookie.value) : [];

  // // Redirect if not logged in or cart is empty
  // if (!session || cart.length === 0) {
  //   redirect('/login');
  // }
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
