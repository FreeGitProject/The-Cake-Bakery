import { Metadata } from 'next'
import RegisterForm from '../../components/RegisterForm'
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
export const metadata: Metadata = {
  title: 'Register | Cake-Bakery Shop',
  description: 'Create a new account for Cake-Bakery Shop',
}

export default async function RegisterPage() {
  const session = await getServerSession();
  //console.log("register",session)
  if (session ) {
    redirect('/'); // Redirect to login if no session or user is not an admin
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>
      <RegisterForm />
    </div>
  )
}

