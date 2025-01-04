"use client"
//import { Metadata } from 'next'
import ProfileComponent from '../../components/ProfileComponent'
import { useSessionContext } from '@/context/SessionContext';
import { redirect } from 'next/navigation';

// export const metadata: Metadata = {
//   title: 'User Profile | Cake-Bakery Shop',
//   description: 'View and edit your profile',
// }

export default function ProfilePage() {

     const { session } = useSessionContext();
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
  )
}

