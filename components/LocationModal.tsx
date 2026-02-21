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

    if (searchTerm) {
      filtered = filtered.filter(
        (city) =>
          city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

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
        const enhancedData = data.map((city: City) => {
          const randomValue = Math.random();
          let size;
          if (randomValue < 0.2) size = "small";
          else if (randomValue < 0.5) size = "medium";
          else if (randomValue < 0.8) size = "large";
          else size = "metro";

          return {
            ...city,
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
    const colorClass = city.isAvailable ? "text-brand-pink" : "text-gray-400"
    switch(city.size) {
      case "metro":
      case "large":
        return <Building2 className={`h-5 w-5 ${colorClass}`} />;
      case "medium":
        return <Map className={`h-5 w-5 ${colorClass}`} />;
      case "small":
      default:
        return <Home className={`h-5 w-5 ${colorClass}`} />;
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
      className={`p-3.5 rounded-xl transition-all duration-300 cursor-pointer mb-2 border ${
        city.isAvailable
          ? "hover:bg-brand-cream/40 hover:border-brand-pink/30 hover:shadow-soft border-gray-100"
          : "opacity-60 bg-gray-50/50 border-gray-100"
      }`}
      onClick={() => handleCitySelect(city)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 transition-colors duration-300 ${
            city.isAvailable
              ? "bg-brand-cream"
              : "bg-gray-100"
          }`}>
            {getCityIcon(city)}
          </div>
          <div>
            <p className="font-semibold text-brand-text text-sm">{city?.name?.toLocaleUpperCase()}, {city?.state?.toLocaleUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center">
          {city.isAvailable ? (
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-50">Available</Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 rounded-lg text-xs font-medium">Unavailable</Badge>
          )}
        </div>
      </div>
    </div>
  )

  const CityCardSkeleton = () => (
    <div className="p-3.5 rounded-xl mb-2 border border-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
    </div>
  )

  return (
    <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-gray-100 shadow-elevated p-0 overflow-hidden">
        {/* Gradient accent top */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9494] via-[#FFB4B4] to-[#FFD1D1]" />

        <div className="p-6 pb-0">
          <DialogHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="bg-gradient-to-br from-[#FF9494] to-[#FFB4B4] p-2.5 rounded-xl shadow-soft">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl text-brand-text">Select Delivery City</DialogTitle>
              <DialogDescription className="text-brand-text-secondary text-sm">
                Choose a city where you want your order delivered
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-pink/50 h-4 w-4" />
            <Input
              placeholder="Search for city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 pr-4 rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 transition-colors bg-brand-cream/20"
            />
          </div>

          {detectedCity && !currentLocation && (
            <div className="mb-4 p-4 bg-brand-cream/40 rounded-xl border border-brand-pink/15">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-[#FF9494] to-[#FFB4B4] p-2 rounded-xl shadow-soft mt-0.5">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-brand-text text-sm">We detected your city</p>
                  <p className="text-sm text-brand-text-secondary mb-2">
                    {detectedCity.name}, {detectedCity.state}
                  </p>
                  {detectedCity.isAvailable ? (
                    <Button
                      onClick={() => handleCitySelect(detectedCity)}
                      className="mt-1 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white rounded-xl text-sm h-9 px-4 transition-all duration-300"
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Deliver to this city
                    </Button>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 rounded-lg mt-1">
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
              className="mb-4 w-full flex items-center justify-center gap-2 rounded-xl border-brand-pink/20 text-brand-pink hover:bg-brand-cream/40 hover:border-brand-pink/40 transition-all duration-300 h-11"
              onClick={handleManualDetection}
            >
              <Navigation className="h-4 w-4" />
              Detect My City
            </Button>
          )}

          {isDetecting && (
            <div className="flex justify-center items-center gap-2 my-4 text-brand-pink">
              <div className="h-5 w-5 rounded-full border-2 border-brand-pink border-t-transparent animate-spin" />
              <p className="text-sm font-medium">Detecting your city...</p>
            </div>
          )}

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-2">
            <TabsList className="grid grid-cols-2 bg-brand-cream/50 rounded-xl p-1 h-auto">
              <TabsTrigger value="all" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-soft data-[state=active]:text-brand-text text-brand-text-secondary text-sm py-2.5 transition-all duration-300">
                <Map className="h-4 w-4" />
                All Cities
              </TabsTrigger>
              <TabsTrigger value="available" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-soft data-[state=active]:text-brand-text text-brand-text-secondary text-sm py-2.5 transition-all duration-300">
                <Check className="h-4 w-4" />
                Available
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
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
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-brand-cream rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Search className="h-5 w-5 text-brand-pink" />
                    </div>
                    <p className="text-brand-text-secondary text-sm">No cities found matching &quot;{searchTerm}&quot;</p>
                    <Button variant="link" onClick={() => setSearchTerm("")} className="text-brand-pink hover:text-brand-pink/80 text-sm mt-1">
                      Clear search
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="available" className="mt-4">
              <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
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
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-brand-cream rounded-xl flex items-center justify-center mx-auto mb-3">
                      <MapPin className="h-5 w-5 text-brand-pink" />
                    </div>
                    <p className="text-brand-text-secondary text-sm">No available cities found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center px-6 pb-5 pt-2 flex items-center justify-center gap-1.5 text-xs text-brand-text-secondary">
          <MapPin className="h-3 w-3 text-brand-pink/60" />
          <span>Not all cities have delivery service available yet. We&apos;re expanding our delivery areas.</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
