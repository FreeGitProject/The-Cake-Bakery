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
  if (session ) {
    redirect('/');
  }
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FAFAFA]">
      <RegisterForm />
    </div>
  )
}
