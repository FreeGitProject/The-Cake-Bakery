"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface Location {
  name: string
  state: string
  latitude?: number
  longitude?: number
}

interface LocationContextType {
  currentLocation: Location | null
  setCurrentLocation: (location: Location | null) => void
  isLocationModalOpen: boolean
  setIsLocationModalOpen: (isOpen: boolean) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/user-location")
          if (response.ok) {
            const data = await response.json()
            setCurrentLocation(data.selectedLocation)
          }
        } catch (error) {
          console.error("Error fetching user location:", error)
        }
      }
    }

    fetchUserLocation()
  }, [session])

  return (
    <LocationContext.Provider
      value={{ currentLocation, setCurrentLocation, isLocationModalOpen, setIsLocationModalOpen }}
    >
      {children}
    </LocationContext.Provider>
  )
}

