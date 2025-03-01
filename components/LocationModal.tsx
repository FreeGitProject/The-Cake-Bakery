"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocation } from "@/context/LocationContext"
import { useToast } from "@/hooks/use-toast"
import { Search, MapPin, Navigation, Check, Building2, Map, Home } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface City {
  name: string
  state: string
  latitude?: number
  longitude?: number
  isAvailable?: boolean
  size?: "small" | "medium" | "large" | "metro"
}

export default function DeliveryCityModal() {
  const { currentLocation, setCurrentLocation, isLocationModalOpen, setIsLocationModalOpen } = useLocation()
  const [cities, setCities] = useState<City[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [detectedCity, setDetectedCity] = useState<City | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCities()
    if (!currentLocation) {
      detectUserCity()
    }
  }, [currentLocation])

  useEffect(() => {
    let filtered = cities
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (city) =>
          city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by tab
    if (activeTab === "available") {
      filtered = filtered.filter(city => city.isAvailable)
    }
    
    setFilteredCities(filtered)
  }, [searchTerm, cities, activeTab])

  const fetchCities = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/locations")
      if (response.ok) {
        const data = await response.json()
        // Mark cities where delivery is available and add city size for icon selection
        const enhancedData = data.map((city: City) => {
          // Determine city size based on some logic (could be population if available)
          // For this example, we'll use a random assignment
          const randomValue = Math.random();
          let size;
          if (randomValue < 0.2) size = "small";
          else if (randomValue < 0.5) size = "medium";
          else if (randomValue < 0.8) size = "large";
          else size = "metro";
          
          return {
            ...city,
           // isAvailable: true,//Math.random() > 0.2, // 80% of cities have delivery available
            size: size as "small" | "medium" | "large" | "metro"
          };
        });
        setCities(enhancedData)
        setFilteredCities(enhancedData)
      } else {
        throw new Error("Failed to fetch cities")
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
      toast({
        title: "Error",
        description: "Failed to fetch delivery cities. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCityIcon = (city: City) => {
    switch(city.size) {
      case "metro":
        return <Building2 className={`h-5 w-5 ${city.isAvailable ? "text-primary" : "text-gray-400"}`} />;
      case "large":
        return <Building2 className={`h-5 w-5 ${city.isAvailable ? "text-primary" : "text-gray-400"}`} />;
      case "medium":
        return <Map className={`h-5 w-5 ${city.isAvailable ? "text-primary" : "text-gray-400"}`} />;
      case "small":
      default:
        return <Home className={`h-5 w-5 ${city.isAvailable ? "text-primary" : "text-gray-400"}`} />;
    }
  };

  const detectUserCity = () => {
    if ("geolocation" in navigator) {
      setIsDetecting(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`,
            )
            const data = await response.json()
            if (data.results && data.results.length > 0) {
              const result = data.results[0]
              const detected = {
                name: result.components.city || result.components.town || result.components.village,
                state: result.components.state,
                latitude,
                longitude,
                isAvailable: true,
                size: "large" as "small" | "medium" | "large" | "metro"
              }
              setDetectedCity(detected)
            }
          } catch (error) {
            console.error("Error detecting city:", error)
          } finally {
            setIsDetecting(false)
          }
        },
        (error) => {
          console.error("Error getting user location:", error)
          setIsDetecting(false)
        },
      )
    }
  }

  const handleManualDetection = () => {
    detectUserCity()
  }

  const handleCitySelect = async (city: City) => {
    if (!city.isAvailable) {
      toast({
        title: "Not Available",
        description: `We don't currently deliver to ${city.name}, ${city.state}`,
        variant: "destructive",
      })
      return
    }
    
    setCurrentLocation(city)
    setIsLocationModalOpen(false)
    
    try {
      await fetch("/api/user-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          selectedLocation: city, 
          autoDetected: city === detectedCity 
        }),
      })
      
      toast({
        title: "Delivery City Updated",
        description: `Your delivery city is now set to ${city.name}`,
      })
    } catch (error) {
      console.error("Error saving delivery city:", error)
    }
  }

  const CityCard = ({ city }: { city: City }) => (
    <div
      className={`p-3 rounded-lg transition-colors cursor-pointer mb-2 border ${
        city.isAvailable 
          ? "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-800"
          : "opacity-70 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
      onClick={() => handleCitySelect(city)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
            {getCityIcon(city)}
          </div>
          <div>
            <p className="font-medium">{city?.name?.toLocaleUpperCase()}, {city?.state?.toLocaleUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center">
          {city.isAvailable ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Unavailable</Badge>
          )}
        </div>
      </div>
    </div>
  )

  const CityCardSkeleton = () => (
    <div className="p-3 rounded-lg mb-2 border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-5 w-32 rounded" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )

  return (
    <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-xl">Select Delivery City</DialogTitle>
            <DialogDescription>
              Choose a city where you want your order delivered
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search for city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 pr-4"
          />
        </div>
        
        {detectedCity && !currentLocation && (
          <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full mt-1">
                {getCityIcon(detectedCity)}
              </div>
              <div>
                <p className="font-medium">We detected your city</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {detectedCity.name}, {detectedCity.state}
                </p>
                {detectedCity.isAvailable ? (
                  <Button 
                    onClick={() => handleCitySelect(detectedCity)} 
                    className="mt-1"
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Deliver to this city
                  </Button>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 mt-1">
                    Delivery not available
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!detectedCity && !isDetecting && !currentLocation && (
          <Button 
            variant="outline" 
            className="mb-4 w-full flex items-center justify-center gap-2"
            onClick={handleManualDetection}
          >
            <Navigation className="h-4 w-4" />
            Detect My City
          </Button>
        )}
        
        {isDetecting && (
          <div className="flex justify-center items-center gap-2 my-4 text-primary">
            <Skeleton className="h-5 w-5 rounded-full animate-pulse" />
            <p>Detecting your city...</p>
          </div>
        )}

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-2">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              All Cities
            </TabsTrigger>
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Available Cities
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="max-h-[350px] overflow-y-auto pr-1">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <CityCardSkeleton key={i} />)
              ) : filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <CityCard 
                    key={`${city.name}-${city.state}`} 
                    city={city} 
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No cities found matching &quot;{searchTerm}&quot;</p>
                  <Button variant="link" onClick={() => setSearchTerm("")}>
                    Clear search
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="available" className="mt-4">
            <div className="max-h-[350px] overflow-y-auto pr-1">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => <CityCardSkeleton key={i} />)
              ) : filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <CityCard 
                    key={`${city.name}-${city.state}`} 
                    city={city} 
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No available cities found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-4 flex items-center justify-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>Not all cities have delivery service available yet. We&apos;re expanding our delivery areas.</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}