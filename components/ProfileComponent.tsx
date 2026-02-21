'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/components/icons";
import {
  User, Mail, MapPin, Home, Building, Flag,
  Hash, Edit2, Save, Loader2, Phone, Plus, Trash2, Sparkles
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-pink" />
          </div>
          <span className="text-brand-text-secondary text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-10 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-brand-cream flex items-center justify-center mb-5">
            <Icons.warning className="h-10 w-10 text-brand-pink/60" />
          </div>
          <h3 className="text-xl font-display font-semibold text-brand-text mb-2">Profile Not Found</h3>
          <p className="text-brand-text-secondary text-center max-w-md mb-8">
            We couldn&apos;t retrieve your profile information.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-gradient-to-r from-brand-pink to-brand-pink-light text-white font-semibold px-8 py-3 shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5 border-0"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-card border border-gray-100/80 overflow-hidden">
        {/* Profile Header */}
        <div className="relative">
          {/* Decorative gradient bar */}
          <div className="h-24 bg-gradient-to-r from-brand-pink via-brand-pink-light to-brand-cream" />

          <div className="px-6 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-10 gap-4">
              <div className="flex items-end gap-4">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-elevated">
                  <AvatarImage src={`https://avatar.vercel.sh/${profile.username}`} alt={profile.username} />
                  <AvatarFallback className="bg-gradient-to-br from-brand-pink to-brand-pink-light text-white text-xl font-display font-bold">
                    {getInitials(profile.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <h2 className="text-2xl font-display font-bold text-brand-text">{profile.username}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5 text-brand-text-secondary text-sm">
                    <Mail className="h-3.5 w-3.5" />
                    {profile.email}
                  </div>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-brand-pink/10 to-brand-pink-light/10 text-brand-pink border-brand-pink/20 px-3 py-1.5 rounded-xl font-semibold text-xs">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Premium Member
              </Badge>
            </div>
          </div>
          <Separator />
        </div>

        {/* Tabs Content */}
        <div className="px-6 sm:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-brand-cream/50 rounded-xl p-1">
              <TabsTrigger
                value="profile"
                className="rounded-lg text-sm font-medium flex items-center data-[state=active]:bg-white data-[state=active]:shadow-soft data-[state=active]:text-brand-text transition-all duration-300"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="rounded-lg text-sm font-medium flex items-center data-[state=active]:bg-white data-[state=active]:shadow-soft data-[state=active]:text-brand-text transition-all duration-300"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Addresses
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 pt-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-display font-semibold text-brand-text">Personal Information</h3>
                  <p className="text-sm text-brand-text-secondary mt-0.5">Manage your account details</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`h-9 rounded-xl transition-all duration-300 ${
                    isEditing
                      ? 'bg-brand-cream border-brand-pink/30 text-brand-pink hover:bg-brand-pink-lighter'
                      : 'border-gray-200 hover:border-brand-pink/30 hover:bg-brand-cream/50'
                  }`}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center text-sm font-medium text-brand-text">
                    <User className="h-4 w-4 mr-2 text-brand-pink" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={profile.username}
                    onChange={handleProfileInputChange}
                    disabled={!isEditing}
                    className={`h-11 rounded-xl transition-all duration-300 ${
                      isEditing
                        ? 'border-brand-pink/30 focus:border-brand-pink focus:ring-brand-pink/20 bg-white'
                        : 'bg-brand-cream/30 border-gray-100'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center text-sm font-medium text-brand-text">
                    <Mail className="h-4 w-4 mr-2 text-brand-pink" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileInputChange}
                    disabled={!isEditing}
                    className={`h-11 rounded-xl transition-all duration-300 ${
                      isEditing
                        ? 'border-brand-pink/30 focus:border-brand-pink focus:ring-brand-pink/20 bg-white'
                        : 'bg-brand-cream/30 border-gray-100'
                    }`}
                  />
                </div>

                {isEditing && (
                  <Button
                    type="submit"
                    className="w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-brand-pink to-brand-pink-light text-white font-semibold shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5 border-0"
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

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6 pt-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-display font-semibold text-brand-text">Address Book</h3>
                  <p className="text-sm text-brand-text-secondary mt-0.5">Manage your delivery addresses</p>
                </div>
                <div className="flex gap-2">
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addNewAddress}
                      className="h-9 rounded-xl border-brand-pink/30 text-brand-pink hover:bg-brand-cream/50 transition-all duration-300"
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" />
                      Add New
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className={`h-9 rounded-xl transition-all duration-300 ${
                      isEditing
                        ? 'bg-brand-cream border-brand-pink/30 text-brand-pink hover:bg-brand-pink-lighter'
                        : 'border-gray-200 hover:border-brand-pink/30 hover:bg-brand-cream/50'
                    }`}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                {profile?.addresses?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {profile?.addresses?.map((address, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAddressIndex(index)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                          selectedAddressIndex === index
                            ? 'bg-gradient-to-r from-brand-pink to-brand-pink-light text-white shadow-soft'
                            : 'bg-brand-cream/50 text-brand-text border border-gray-100 hover:border-brand-pink/30'
                        }`}
                      >
                        {address.type === 'Home' ? <Home className="w-3.5 h-3.5" /> : address.type === 'Work' ? <Building className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                        {address.type}
                        {address.isDefault && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                            selectedAddressIndex === index
                              ? 'bg-white/25 text-white'
                              : 'bg-brand-pink/10 text-brand-pink'
                          }`}>
                            Default
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {profile?.addresses?.length > 0 ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="w-1/2 space-y-2">
                        <Label htmlFor="type" className="text-sm font-medium text-brand-text">Address Type</Label>
                        <Select
                          disabled={!isEditing}
                          value={profile?.addresses[selectedAddressIndex].type}
                          onValueChange={(value) => handleAddressTypeChange(value, selectedAddressIndex)}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-gray-200 transition-all duration-300">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Home">Home</SelectItem>
                            <SelectItem value="Work">Work</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {isEditing && profile?.addresses.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAddress(selectedAddressIndex)}
                          className="h-9 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 transition-all duration-300"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center text-sm font-medium text-brand-text">
                        <Phone className="h-4 w-4 mr-2 text-brand-pink" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profile?.addresses[selectedAddressIndex].phone}
                        onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
                        disabled={!isEditing}
                        className={`h-11 rounded-xl transition-all duration-300 ${
                          isEditing
                            ? 'border-brand-pink/30 focus:border-brand-pink focus:ring-brand-pink/20 bg-white'
                            : 'bg-brand-cream/30 border-gray-100'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street" className="flex items-center text-sm font-medium text-brand-text">
                        <Home className="h-4 w-4 mr-2 text-brand-pink" />
                        Street Address
                      </Label>
                      <Input
                        id="street"
                        name="street"
                        value={profile?.addresses[selectedAddressIndex].street || ''}
                        onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
                        disabled={!isEditing}
                        className={`h-11 rounded-xl transition-all duration-300 ${
                          isEditing
                            ? 'border-brand-pink/30 focus:border-brand-pink focus:ring-brand-pink/20 bg-white'
                            : 'bg-brand-cream/30 border-gray-100'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="flex items-center text-sm font-medium text-brand-text">
                          <Building className="h-4 w-4 mr-2 text-brand-pink" />
                          City
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={profile?.addresses[selectedAddressIndex].city || ''}
                          onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
                          disabled={!isEditing}
                          className={`h-11 rounded-xl transition-all duration-300 ${
                            isEditing
                              ? 'border-brand-pink/30 focus:border-brand-pink focus:ring-brand-pink/20 bg-white'
                              : 'bg-brand-cream/30 border-gray-100'
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="flex items-center text-sm font-medium text-brand-text">
                          <MapPin className="h-4 w-4 mr-2 text-brand-pink" />
                          State/Province
                        </Label>
                        <Input
                          id="state"
                          name="state"
                          value={profile?.addresses[selectedAddressIndex].state || ''}
                          onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
                          disabled={!isEditing}
                          className={`h-11 rounded-xl transition-all duration-300 ${
                            isEditing
                              ? 'border-brand-pink/30 focus:border-brand-pink focus:ring-brand-pink/20 bg-white'
                              : 'bg-brand-cream/30 border-gray-100'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode" className="flex items-center text-sm font-medium text-brand-text">
                          <Hash className="h-4 w-4 mr-2 text-brand-pink" />
                          Zip/Postal Code
                        </Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={profile?.addresses[selectedAddressIndex].zipCode || ''}
                          onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
                          disabled={!isEditing}
                          className={`h-11 rounded-xl transition-all duration-300 ${
                            isEditing
                              ? 'border-brand-pink/30 focus:border-brand-pink focus:ring-brand-pink/20 bg-white'
                              : 'bg-brand-cream/30 border-gray-100'
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="flex items-center text-sm font-medium text-brand-text">
                          <Flag className="h-4 w-4 mr-2 text-brand-pink" />
                          Country
                        </Label>
                        <Input
                          id="country"
                          name="country"
                          value={profile?.addresses[selectedAddressIndex].country || ''}
                          onChange={(e) => handleAddressInputChange(e, selectedAddressIndex)}
                          disabled={!isEditing}
                          className={`h-11 rounded-xl transition-all duration-300 ${
                            isEditing
                              ? 'border-brand-pink/30 focus:border-brand-pink focus:ring-brand-pink/20 bg-white'
                              : 'bg-brand-cream/30 border-gray-100'
                          }`}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex flex-col gap-3 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDefaultAddress(selectedAddressIndex)}
                          disabled={profile?.addresses[selectedAddressIndex].isDefault}
                          className={`h-11 rounded-xl transition-all duration-300 ${
                            profile?.addresses[selectedAddressIndex].isDefault
                              ? 'bg-brand-cream/50 border-brand-pink/20 text-brand-pink'
                              : 'border-gray-200 hover:border-brand-pink/30 hover:bg-brand-cream/50'
                          }`}
                        >
                          {profile?.addresses[selectedAddressIndex].isDefault ?
                            'Default Address' : 'Set as Default Address'}
                        </Button>

                        <Button
                          type="submit"
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-pink to-brand-pink-light text-white font-semibold shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5 border-0"
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
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-brand-cream mx-auto flex items-center justify-center mb-5">
                      <MapPin className="h-10 w-10 text-brand-pink/60" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-brand-text mb-2">No Addresses Found</h3>
                    <p className="text-brand-text-secondary mb-6 max-w-sm mx-auto">
                      You haven&apos;t added any addresses yet.
                    </p>
                    <Button
                      onClick={() => {
                        setIsEditing(true);
                        addNewAddress();
                      }}
                      className="rounded-xl bg-gradient-to-r from-brand-pink to-brand-pink-light text-white font-semibold px-6 py-3 shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5 border-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Address
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
