'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  username: string
  email: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export default function ProfileComponent() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user) {
      setProfile({
        username: session.user.name || '',
        email: session.user.email || '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      })
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => {
      if (!prev) return null
      if (name in prev.address) {
        return { ...prev, address: { ...prev.address, [name]: value } }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !session?.user) return

    try {
      const response = await fetch('/api/user/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': session.user.id, // Send the user ID in the headers
        },
        body: JSON.stringify(profile.address),
      })

      if (response.ok) {
        setIsEditing(false) // Disable editing after successful submission
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
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
          <div>
            <Label htmlFor="street">Street</Label>
            <Input
              id="street"
              name="street"
              value={profile.address.street}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={profile.address.city}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              value={profile.address.state}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={profile.address.zipCode}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={profile.address.country}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
         
            <Button type="submit">Save Changes</Button>
        
        </form>
      </CardContent>
    </Card>
  )
}
