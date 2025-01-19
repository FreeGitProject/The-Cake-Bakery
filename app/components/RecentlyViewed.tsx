'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

interface Cake {
  _id: string
  name: string
  image: string[]
  averageRating: number
}

export default function RecentlyViewed({ currentCakeId }: { currentCakeId: string }) {
  const [recentlyViewed, setRecentlyViewed] = useState<Cake[]>([])

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      const storedIds = JSON.parse(localStorage.getItem('recentlyViewedCakes') || '[]')
      const uniqueIds = Array.from(new Set([currentCakeId, ...storedIds])).slice(0, 5)
      
      localStorage.setItem('recentlyViewedCakes', JSON.stringify(uniqueIds))

      const cakes = await Promise.all(
        uniqueIds.filter(id => id !== currentCakeId).map(async (id) => {
          const response = await fetch(`/api/cakes/${id}`)
          return response.json()
        })
      )

      setRecentlyViewed(cakes)
    }

    fetchRecentlyViewed()
  }, [currentCakeId])

  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
      <Carousel className="w-full lg:max-w-4xl md:max-w-3xl sm:max-w-sm mx-auto">
        <CarouselContent>
          {recentlyViewed?.map((cake) => (
            <CarouselItem key={cake._id} className="sm:basis-1/1 md:basis-1/2 lg:basis-1/3">
              <Link href={`/cakes/${cake._id}`}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm truncate">{cake.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Image
                      src={cake.image[0] || "/placeholder.svg"}
                      alt={cake.name}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <div className="mt-2 text-sm text-center">
                      Rating: {cake.averageRating.toFixed(1)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

