'use client';
//import { Metadata } from 'next'
import ProfileComponent from '@/features/profile/components/ProfileComponent';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

// export const metadata: Metadata = {
//   title: 'User Profile | Cake-Bakery Shop',
//   description: 'View and edit your profile',
// }

export default function ProfilePage() {
  const { data: session } = useSession();
  //  console.log('ProfilePage', session);
  //if (loading) return <p>Loading...</p>;
  //console.log('ProfilePage', session); // Log the session

  if (!session) {
    redirect('/login'); // Redirect to login if no session or user is not an admin
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
      <ProfileComponent />
    </div>
  );
}
