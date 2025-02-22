"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface EventCake {
  _id: string
  name: string
  description: string
  image: string[]
  eventStartDate: string
  eventEndDate: string
}

export function EventCarousel() {
  const [eventCakes, setEventCakes] = useState<EventCake[]>([])

  useEffect(() => {
    const fetchEventCakes = async () => {
      try {
        const response = await fetch("/api/cakes/events")
        if (response.ok) {
          const data = await response.json()
          setEventCakes(data)
        } else {
          throw new Error("Failed to fetch event cakes")
        }
      } catch (error) {
        console.error("Error fetching event cakes:", error)
      }
    }

    fetchEventCakes()
  }, [])

  if (eventCakes.length === 0) {
    return null
  }

  return (
    <Carousel className="w-full max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
      <CarouselContent>
        {eventCakes.map((cake) => (
          <CarouselItem key={cake._id}>
            <Card>
              <CardHeader>
                <CardTitle>{cake.name}</CardTitle>
                <Badge variant="secondary">Event</Badge>
              </CardHeader>
              <CardContent>
                <Image
                  src={cake.image[0] || "/placeholder.svg"}
                  alt={cake.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <p className="text-sm text-gray-600 mb-2">{cake.description.substring(0, 100)}...</p>
                <p className="text-sm">
                  Event period: {new Date(cake.eventStartDate).toLocaleDateString()} -{" "}
                  {new Date(cake.eventEndDate).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/cakes/${cake._id}`}>
                  <Button>View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

