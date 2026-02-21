"use client"
import ProfileComponent from '../../components/ProfileComponent'
import { useSessionContext } from '@/context/SessionContext';
import { redirect } from 'next/navigation';

export default function ProfilePage() {
  const { session } = useSessionContext();

  if (!session) {
    redirect('/login');
  }
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-text mb-8 text-center">Your Profile</h1>
        <ProfileComponent />
      </div>
    </div>
  )
}
