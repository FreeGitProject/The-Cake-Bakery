import { Metadata } from 'next'
import LoginForm from '../components/LoginForm'
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth'; // Import your auth options if needed

export const metadata: Metadata = {
  title: 'Login | Cake-Bakery Shop',
  description: 'Login to your Cake-Bakery Shop account',
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session ) {
    redirect('/'); // Redirect to login if no session or user is not an admin
  }
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FAFAFA]">
      <LoginForm />
    </div>
  )
}
