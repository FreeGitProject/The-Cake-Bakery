import { Metadata } from 'next'
import CheckoutForm from '../components/CheckoutForm'
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
export const metadata: Metadata = {
  title: 'Checkout | The Cake Shop',
  description: 'Complete your order from The Cake Shop',
}

export default async  function CheckoutPage() {
    const session = await getServerSession();
    if (!session ) {
      redirect('/'); 
    }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}

