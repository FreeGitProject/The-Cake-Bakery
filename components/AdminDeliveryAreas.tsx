'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Navigation, Circle, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
  const [activeView, setActiveView] = useState('grid')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchDeliveryAreas()
    }
  }, [session])

  const fetchDeliveryAreas = async () => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewArea(prev => ({ ...prev, [name]: name === 'pincode' ? value : parseFloat(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this delivery area?')) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/delivery-areas/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          toast({
            title: "Success",
            description: "Delivery area deleted successfully.",
          })
          fetchDeliveryAreas()
        } else {
          throw new Error('Failed to delete delivery area')
        }
      } catch (error) {
        console.error('Error deleting delivery area:', error)
        toast({
          title: "Error",
          description: "Failed to delete delivery area. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (session?.user?.role !== 'admin') {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-red-500">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">You do not have permission to view this page.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Delivery Areas Management</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveView('grid')}
              className={activeView === 'grid' ? 'bg-primary text-primary-foreground' : ''}
            >
              Grid View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveView('table')}
              className={activeView === 'table' ? 'bg-primary text-primary-foreground' : ''}
            >
              Table View
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-xl">Add New Delivery Area</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pincode</label>
                <div className="relative">
                  <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="pincode"
                    value={newArea.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter pincode"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Latitude</label>
                <div className="relative">
                  <Navigation className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="latitude"
                    type="number"
                    step="any"
                    value={newArea.latitude}
                    onChange={handleInputChange}
                    placeholder="Enter latitude"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Longitude</label>
                <div className="relative">
                  <Navigation className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 rotate-90" />
                  <Input
                    name="longitude"
                    type="number"
                    step="any"
                    value={newArea.longitude}
                    onChange={handleInputChange}
                    placeholder="Enter longitude"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Radius (km)</label>
                <div className="relative">
                  <Circle className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="radius"
                    type="number"
                    step="any"
                    value={newArea.radius}
                    onChange={handleInputChange}
                    placeholder="Enter radius"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Delivery Area"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {activeView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveryAreas.map((area) => (
              <Card key={area._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Pincode: {area.pincode}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(area._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Navigation className="h-4 w-4" />
                    <span>Lat: {area.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Navigation className="h-4 w-4 rotate-90" />
                    <span>Long: {area.longitude.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Circle className="h-4 w-4" />
                    <span>Radius: {area.radius} km</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pincode</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead>Radius (km)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryAreas.map((area) => (
                  <TableRow key={area._id}>
                    <TableCell className="font-medium">{area.pincode}</TableCell>
                    <TableCell>{area.latitude.toFixed(6)}</TableCell>
                    <TableCell>{area.longitude.toFixed(6)}</TableCell>
                    <TableCell>{area.radius}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(area._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}