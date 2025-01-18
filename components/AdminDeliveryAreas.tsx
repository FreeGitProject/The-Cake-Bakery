'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface DeliveryArea {
  _id: string;
  pincode: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export default function AdminDeliveryAreas() {
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([])
  const [newArea, setNewArea] = useState<Omit<DeliveryArea, '_id'>>({
    pincode: '',
    latitude: 0,
    longitude: 0,
    radius: 0,
  })
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchDeliveryAreas()
    }
  }, [session])

  const fetchDeliveryAreas = async () => {
    try {
      const response = await fetch('/api/admin/delivery-areas')
      if (response.ok) {
        const data = await response.json()
        setDeliveryAreas(data)
      } else {
        throw new Error('Failed to fetch delivery areas')
      }
    } catch (error) {
      console.error('Error fetching delivery areas:', error)
      toast({
        title: "Error",
        description: "Failed to fetch delivery areas. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewArea(prev => ({ ...prev, [name]: name === 'pincode' ? value : parseFloat(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/delivery-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArea),
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Delivery area added successfully.",
        })
        fetchDeliveryAreas()
        setNewArea({
          pincode: '',
          latitude: 0,
          longitude: 0,
          radius: 0,
        })
      } else {
        throw new Error('Failed to add delivery area')
      }
    } catch (error) {
      console.error('Error adding delivery area:', error)
      toast({
        title: "Error",
        description: "Failed to add delivery area. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (session?.user?.role !== 'admin') {
    return <p>You do not have permission to view this page.</p>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Delivery Areas</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="pincode"
          value={newArea.pincode}
          onChange={handleInputChange}
          placeholder="Pincode"
          required
        />
        <Input
          name="latitude"
          type="number"
          step="any"
          value={newArea.latitude}
          onChange={handleInputChange}
          placeholder="Latitude"
          required
        />
        <Input
          name="longitude"
          type="number"
          step="any"
          value={newArea.longitude}
          onChange={handleInputChange}
          placeholder="Longitude"
          required
        />
        <Input
          name="radius"
          type="number"
          step="any"
          value={newArea.radius}
          onChange={handleInputChange}
          placeholder="Radius (in km)"
          required
        />
        <Button type="submit">Add Delivery Area</Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliveryAreas.map((area) => (
          <Card key={area._id}>
            <CardHeader>
              <CardTitle>{area.pincode}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Latitude: {area.latitude}</p>
              <p>Longitude: {area.longitude}</p>
              <p>Radius: {area.radius} km</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

