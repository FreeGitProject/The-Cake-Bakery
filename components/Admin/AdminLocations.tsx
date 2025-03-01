"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MapPin, Search, Plus, Trash2, Edit2, MapPinOff, RefreshCw, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface Location {
  _id: string
  name: string
  state: string
  latitude?: number
  longitude?: number
  isAvailable?: boolean
  createdAt?: string
  updatedAt?: string
}

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [stateFilter, setStateFilter] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [newLocation, setNewLocation] = useState({
    name: "",
    state: "",
    latitude: "",
    longitude: "",
    isAvailable: false
  })
  const [statesList, setStatesList] = useState<string[]>([])
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
        setFilteredLocations(data)
        
        // Extract unique states for filter dropdown
        const states = [...new Set(data.map((loc: Location) => loc.state))].sort() as string[];

              //console.log(states)
        setStatesList(states )
      } else {
        throw new Error("Failed to fetch locations")
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch locations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchLocations()
    }
  }, [session, fetchLocations])

  useEffect(() => {
    // Apply filters when any filter changes
    let results = [...locations]
    
    if (searchQuery) {
      results = results.filter(
        loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               loc.state.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (stateFilter) {
      results = results.filter(loc => loc.state === stateFilter)
    }
    
    if (availabilityFilter) {
      if (availabilityFilter === 'available') {
        results = results.filter(loc => loc.isAvailable === true)
      } else if (availabilityFilter === 'unavailable') {
        results = results.filter(loc => loc.isAvailable === false)
      }
    }
    
    setFilteredLocations(results)
  }, [locations, searchQuery, stateFilter, availabilityFilter])

  const resetFilters = () => {
    setSearchQuery("")
    setStateFilter("")
    setAvailabilityFilter("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (openEditDialog && currentLocation) {
      setCurrentLocation({
        ...currentLocation,
        [name]: value
      })
    } else {
      setNewLocation((prev) => ({ ...prev, [name]: value }))
    }
  }

  const openEditForm = (location: Location) => {
    setCurrentLocation(location)
    setOpenEditDialog(true)
  }

  const resetNewLocationForm = () => {
    setNewLocation({
      name: "",
      state: "",
      latitude: "",
      longitude: "",
      isAvailable: true
    })
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLocation,
          latitude: newLocation.latitude ? Number.parseFloat(newLocation.latitude) : undefined,
          longitude: newLocation.longitude ? Number.parseFloat(newLocation.longitude) : undefined,
        }),
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Location added successfully.",
        })
        fetchLocations()
        resetNewLocationForm()
        setOpenAddDialog(false)
      } else {
        throw new Error("Failed to create location")
      }
    } catch (error) {
      console.error("Error creating location:", error)
      toast({
        title: "Error",
        description: "Failed to create location. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentLocation) return
    
    try {
      const response = await fetch(`/api/locations/${currentLocation._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentLocation,
          latitude: currentLocation.latitude || undefined,
          longitude: currentLocation.longitude || undefined,
        }),
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Location updated successfully.",
        })
        fetchLocations()
        setOpenEditDialog(false)
      } else {
        throw new Error("Failed to update location")
      }
    } catch (error) {
      console.error("Error updating location:", error)
      toast({
        title: "Error",
        description: "Failed to update location. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Location deleted successfully.",
        })
        fetchLocations()
      } else {
        throw new Error("Failed to delete location")
      }
    } catch (error) {
      console.error("Error deleting location:", error)
      toast({
        title: "Error",
        description: "Failed to delete location. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleAvailability = async (location: Location) => {
    try {
      const response = await fetch(`/api/locations/${location._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...location,
          isAvailable: !location.isAvailable
        }),
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: `Location ${!location.isAvailable ? 'enabled' : 'disabled'} successfully.`,
        })
        fetchLocations()
      } else {
        throw new Error("Failed to update location availability")
      }
    } catch (error) {
      console.error("Error updating location:", error)
      toast({
        title: "Error",
        description: "Failed to update location. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (session?.user?.role !== "admin") {
    router.push("/unauthorized")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-500">Access Denied</CardTitle>
            <CardDescription>You do not have permission to view this page.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/")}>Return to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Location Management</h1>
          <p className="text-muted-foreground">Manage delivery locations and availability</p>
        </div>
        <Button 
          onClick={() => setOpenAddDialog(true)} 
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Location
        </Button>
      </div>

      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Enter the details for the new delivery location.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                name="name"
                value={newLocation.name}
                onChange={handleInputChange}
                placeholder="e.g. Downtown"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state"
                name="state" 
                value={newLocation.state} 
                onChange={handleInputChange} 
                placeholder="e.g. California" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  value={newLocation.latitude}
                  onChange={handleInputChange}
                  placeholder="e.g. 34.0522"
                  type="number"
                  step="any"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  value={newLocation.longitude}
                  onChange={handleInputChange}
                  placeholder="e.g. -118.2437"
                  type="number"
                  step="any"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={newLocation.isAvailable}
                onCheckedChange={(checked) => setNewLocation(prev => ({ ...prev, isAvailable: checked }))}
              />
              <Label htmlFor="isAvailable">Available for Delivery</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
              <Button type="submit">Add Location</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update the details for this delivery location.
            </DialogDescription>
          </DialogHeader>
          {currentLocation && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Location Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={currentLocation.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state">State</Label>
                <Input 
                  id="edit-state"
                  name="state" 
                  value={currentLocation.state} 
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-latitude">Latitude</Label>
                  <Input
                    id="edit-latitude"
                    name="latitude"
                    value={currentLocation.latitude || ''}
                    onChange={handleInputChange}
                    type="number"
                    step="any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-longitude">Longitude</Label>
                  <Input
                    id="edit-longitude"
                    name="longitude"
                    value={currentLocation.longitude || ''}
                    onChange={handleInputChange}
                    type="number"
                    step="any"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isAvailable"
                  checked={currentLocation.isAvailable || false}
                  onCheckedChange={(checked) => setCurrentLocation(prev => prev ? { ...prev, isAvailable: checked } : null)}
                />
                <Label htmlFor="edit-isAvailable">Available for Delivery</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Locations Dashboard</CardTitle>
          <CardDescription>Manage and monitor all delivery locations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All States</SelectItem>
                  {statesList.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || stateFilter || availabilityFilter) && (
                <Button variant="outline" size="icon" onClick={resetFilters} title="Clear filters">
                  <X size={16} />
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={fetchLocations} title="Refresh data">
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-36 grid-cols-2">
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
            </TabsList>
            <TabsContent value="table" className="mt-4">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>Coordinates</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLocations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <MapPinOff size={24} className="mb-2" />
                                <p>No locations found</p>
                                <Button variant="link" onClick={resetFilters} className="mt-2">
                                  Clear filters
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLocations.map((location) => (
                            <TableRow key={location._id}>
                              <TableCell className="font-medium">{location.name}</TableCell>
                              <TableCell>{location.state}</TableCell>
                              <TableCell>
                                {location.latitude && location.longitude ? (
                                  <span className="text-sm">
                                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Not specified</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={location.isAvailable ? "default" : "secondary"}>
                                  {location.isAvailable ? "Available" : "Unavailable"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => handleToggleAvailability(location)}
                                    title={location.isAvailable ? "Disable location" : "Enable location"}
                                  >
                                    {location.isAvailable ? <X size={16} /> : <Check size={16} />}
                                  </Button>
                                  <Button
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => openEditForm(location)}
                                    title="Edit location"
                                  >
                                    <Edit2 size={16} />
                                  </Button>
                                  <Button
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => handleDelete(location._id)}
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                    title="Delete location"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Showing {filteredLocations.length} of {locations.length} locations
                    {(searchQuery || stateFilter || availabilityFilter) && " (filtered)"}
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="cards" className="mt-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {filteredLocations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
                      <MapPinOff size={48} className="mb-4" />
                      <p className="text-lg">No locations found</p>
                      <Button variant="link" onClick={resetFilters} className="mt-2">
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredLocations.map((location) => (
                          <Card key={location._id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-md">{location.name}</CardTitle>
                                <Badge variant={location.isAvailable ? "default" : "secondary"}>
                                  {location.isAvailable ? "Available" : "Unavailable"}
                                </Badge>
                              </div>
                              <CardDescription>{location.state}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="flex items-center text-sm space-x-2 text-muted-foreground">
                                <MapPin size={16} />
                                <span>
                                  {location.latitude && location.longitude 
                                    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                                    : "No coordinates specified"
                                  }
                                </span>
                              </div>
                            </CardContent>
                            <Separator />
                            <CardFooter className="pt-4 flex justify-between">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleAvailability(location)}
                              >
                                {location.isAvailable ? "Disable" : "Enable"}
                              </Button>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => openEditForm(location)}
                                >
                                  <Edit2 size={16} />
                                </Button>
                                <Button
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleDelete(location._id)}
                                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                  <div className="mt-4 text-sm text-muted-foreground">
                    Showing {filteredLocations.length} of {locations.length} locations
                    {(searchQuery || stateFilter || availabilityFilter) && " (filtered)"}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}