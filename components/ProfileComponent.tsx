'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { 
  User, Mail, MapPin, Home, Building, Flag, 
  Hash, Edit2, Save, Loader2
} from "lucide-react";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/user/${session.user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
        } else {
          throw new Error('Failed to fetch user details');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast({
          title: "Error fetching profile",
          description: "Could not retrieve your profile information. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [session, toast]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setProfile(prev => {
      if (!prev) return null;
      const updatedAddress = prev.address || {};
      
      return {
        ...prev,
        address: { 
          ...updatedAddress, 
          [name]: value 
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !session?.user) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
          address: profile.address,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile.user);
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <Icons.warning className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Profile Not Found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            We couldn&apos;t retrieve your profile information. This might be because you&apos;re not logged in or there was an error with our servers.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
          <div className="flex items-center">
            <Avatar className="h-16 w-16 mr-4 border-2 border-primary/20">
              <AvatarImage src={`https://avatar.vercel.sh/${profile.username}`} alt={profile.username} />
              <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl mb-1">{profile.username}</CardTitle>
              <CardDescription className="flex items-center">
                <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                {profile.email}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1 mt-2 sm:mt-0">
            Premium Member
          </Badge>
        </div>
        <Separator className="my-2" />
      </CardHeader>
      
      <CardContent>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="profile" className="text-sm flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="address" className="text-sm flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Address Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 pt-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <Button
                variant={isEditing ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-9"
              >
                {isEditing ? (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                  </>
                )}
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center text-sm font-medium">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={profile.username}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  className={isEditing ? "border-primary/50 focus:border-primary" : ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-sm font-medium">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  className={isEditing ? "border-primary/50 focus:border-primary" : ""}
                />
              </div>
              
              {isEditing && (
                <Button 
                  type="submit" 
                  className="w-full mt-6"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              )}
            </form>
          </TabsContent>

          <TabsContent value="address" className="space-y-6 pt-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Location Details</h3>
              <Button
                variant={isEditing ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-9"
              >
                {isEditing ? (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Address
                  </>
                )}
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street" className="flex items-center text-sm font-medium">
                  <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                  Street Address
                </Label>
                <Input
                  id="street"
                  name="street"
                  value={profile.address?.street || ''}
                  onChange={handleAddressInputChange}
                  disabled={!isEditing}
                  placeholder={!isEditing && !profile.address?.street ? "No street address provided" : ""}
                  className={isEditing ? "border-primary/50 focus:border-primary" : ""}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center text-sm font-medium">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={profile.address?.city || ''}
                    onChange={handleAddressInputChange}
                    disabled={!isEditing}
                    placeholder={!isEditing && !profile.address?.city ? "No city provided" : ""}
                    className={isEditing ? "border-primary/50 focus:border-primary" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state" className="flex items-center text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    State/Province
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={profile.address?.state || ''}
                    onChange={handleAddressInputChange}
                    disabled={!isEditing}
                    placeholder={!isEditing && !profile.address?.state ? "No state provided" : ""}
                    className={isEditing ? "border-primary/50 focus:border-primary" : ""}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="flex items-center text-sm font-medium">
                    <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                    Zip/Postal Code
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={profile.address?.zipCode || ''}
                    onChange={handleAddressInputChange}
                    disabled={!isEditing}
                    placeholder={!isEditing && !profile.address?.zipCode ? "No zip code provided" : ""}
                    className={isEditing ? "border-primary/50 focus:border-primary" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center text-sm font-medium">
                    <Flag className="h-4 w-4 mr-2 text-muted-foreground" />
                    Country
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={profile.address?.country || ''}
                    onChange={handleAddressInputChange}
                    disabled={!isEditing}
                    placeholder={!isEditing && !profile.address?.country ? "No country provided" : ""}
                    className={isEditing ? "border-primary/50 focus:border-primary" : ""}
                  />
                </div>
              </div>
              
              {isEditing && (
                <Button 
                  type="submit" 
                  className="w-full mt-6"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Address
                    </>
                  )}
                </Button>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}