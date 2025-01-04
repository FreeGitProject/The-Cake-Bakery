'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming you have a tabs component
import Link from 'next/link';

interface UserProfile {
  username: string;
  email: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export default function ProfileComponent() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(true); // Ensure you can edit when the component loads
  const { toast } = useToast();

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch(`/api/user/${session.user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.user); // Bind data to profile state
        } else {
          throw new Error('Failed to fetch user details');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user details. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchUserDetails();
  }, [session, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfile(prev => {
      if (!prev) return null; // Guard clause to check if profile exists

      // Initialize address as an empty object if it's undefined
      const updatedAddress = prev.address ?? {};

      return {
        ...prev,
        address: { ...updatedAddress, [name]: value },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !session?.user) return;

    try {
      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: profile.address, // Sending only the address object
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile.user); // Update the profile state
        setIsEditing(false); // Disable editing after successful submission
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
               {/* Conditionally render Admin page link if the user is an admin */}
               {session?.user?.role === 'admin' && (
            <div className="mt-4">
              <Link
                href="/admin"
                className="text-[#4A4A4A] hover:text-[#FF9494] transition duration-300"
              >
                Go Admin Page
              </Link>
            </div>
          )}
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleSubmit} className="space-y-4">
        
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={profile.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <Button onClick={() => setIsEditing(true)} type="button">
                Edit Profile
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="address">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  name="street"
                  value={profile.address?.street || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={profile.address?.city || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={profile.address?.state || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={profile.address?.zipCode || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={profile.address?.country || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <Button onClick={() => setIsEditing(true)} type="button">
                Edit Address
              </Button>
              <Button type="submit">Save Changes</Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
