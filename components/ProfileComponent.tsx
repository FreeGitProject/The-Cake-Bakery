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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/components/icons";
import { 
  User, Mail, MapPin, Home, Building, Flag, 
  Hash, Edit2, Save, Loader2, Phone, Plus, Trash2
} from "lucide-react";

interface UserProfile {
  username: string;
  email: string;
  addresses: {
    type: string;
    phone: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    isDefault?: boolean;
  }[];
}

export default function ProfileComponent() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/user/${session.user.id}`);
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
          description: "Could not retrieve your profile information.",
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
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    setProfile(prev => {
      if (!prev) return null;
      const updatedAddresses = [...prev.addresses];
      updatedAddresses[index] = {
        ...updatedAddresses[index],
        [name]: value
      };
      return { ...prev, addresses: updatedAddresses };
    });
  };

  const handleAddressTypeChange = (value: string, index: number) => {
    setProfile(prev => {
      if (!prev) return null;
      const updatedAddresses = [...prev.addresses];
      updatedAddresses[index] = {
        ...updatedAddresses[index],
        type: value
      };
      return { ...prev, addresses: updatedAddresses };
    });
  };

  const addNewAddress = () => {
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        addresses: [
          ...(prev.addresses || []), // Ensure addresses is an array
          {
            type: "Home",
            phone: "",
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
            isDefault: false
          }
        ]
      };
    });
    setSelectedAddressIndex(profile?.addresses.length || 0);
  };

  const removeAddress = (index: number) => {
    setProfile(prev => {
      if (!prev) return null;
      const updatedAddresses = prev.addresses.filter((_, i) => i !== index);
      return { ...prev, addresses: updatedAddresses };
    });
    setSelectedAddressIndex(0);
  };

  const setDefaultAddress = (index: number) => {
    setProfile(prev => {
      if (!prev) return null;
      const updatedAddresses = prev.addresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index
      }));
      return { ...prev, addresses: updatedAddresses };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !session?.user) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
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
        description: "There was a problem saving your changes.",
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
            We couldn&apos;t retrieve your profile information.
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="profile" className="text-sm flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="addresses" className="text-sm flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Addresses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 pt-2">
            {/* Profile tab content remains the same */}
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

          <TabsContent value="addresses" className="space-y-6 pt-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Address Information</h3>
              <div className="space-x-2">
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addNewAddress}
                    className="h-9"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                )}
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
                      <Edit2 className="h-4 w-4 mr-2" /> Edit Addresses
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {profile?.addresses?.length > 0 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {profile?.addresses?.map((address, index) => (
                    <Button
                      key={index}
                      variant={selectedAddressIndex === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAddressIndex(index)}
                      className="flex items-center whitespace-nowrap"
                    >
                      {address.type}
                      {address.isDefault && (
                        <Badge variant="secondary" className="ml-2">Default</Badge>
                      )}
                    </Button>
                  ))}
                </div>
              )}

              {profile?.addresses?.length > 0 ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-1/2 space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium">Address Type</Label>
                      <Select
                        disabled={!isEditing}
                        value={profile?.addresses[selectedAddressIndex].type}
                        onValueChange={(value) => handleAddressTypeChange(value, selectedAddressIndex)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {isEditing && profile?.addresses.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAddress(selectedAddressIndex)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Address
                      </Button>
                    )}
                  </div>

                  
    <div className="space-y-2">
      <Label htmlFor="phone" className="flex items-center text-sm font-medium">
        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
        Phone Number
      </Label>
      <Input
        id="phone"
        name="phone"
        value={profile?.addresses[selectedAddressIndex].phone}
        onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
        disabled={!isEditing}
        className={isEditing ? "border-primary/50 focus:border-primary" : ""}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="street" className="flex items-center text-sm font-medium">
        <Home className="h-4 w-4 mr-2 text-muted-foreground" />
        Street Address
      </Label>
      <Input
        id="street"
        name="street"
        value={profile?.addresses[selectedAddressIndex].street || ''}
        onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
        disabled={!isEditing}
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
          value={profile?.addresses[selectedAddressIndex].city || ''}
          onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
          disabled={!isEditing}
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
          value={profile?.addresses[selectedAddressIndex].state || ''}
          onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
          disabled={!isEditing}
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
          value={profile?.addresses[selectedAddressIndex].zipCode || ''}
          onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
          disabled={!isEditing}
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
          value={profile?.addresses[selectedAddressIndex].country || ''}
          onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
          disabled={!isEditing}
          className={isEditing ? "border-primary/50 focus:border-primary" : ""}
        />
      </div>
    </div>

    {isEditing && (
      <div className="flex flex-col space-y-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setDefaultAddress(selectedAddressIndex)}
          disabled={profile?.addresses[selectedAddressIndex].isDefault}
        >
          {profile?.addresses[selectedAddressIndex].isDefault ? 
            'Default Address' : 'Set as Default Address'}
        </Button>

        <Button 
          type="submit" 
          className="w-full"
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
              Save Addresses
            </>
          )}
        </Button>
      </div>
    )}
  </form>
) : (
  <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Addresses Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t added any addresses yet.
                  </p>
                  <Button onClick={() => {
                    setIsEditing(true);
                    addNewAddress();
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Address
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}