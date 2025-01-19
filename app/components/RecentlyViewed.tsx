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
  const [apiError, setApiError] = useState<string>('')

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const storedIds = JSON.parse(localStorage.getItem('recentlyViewedCakes') || '[]')
        const uniqueIds = Array.from(new Set([currentCakeId, ...storedIds])).slice(0, 5)
        
        localStorage.setItem('recentlyViewedCakes', JSON.stringify(uniqueIds))

        const cakes = await Promise.all(
          uniqueIds
            .filter(id => id !== currentCakeId)
            .map(async (id) => {
              const response = await fetch(`/api/cakes/${id}`)
              if (!response.ok) {
                throw new Error(`Failed to fetch cake ${id}`)
              }
              return response.json()
            })
        )

        setRecentlyViewed(cakes)
      } catch (error) {
        setApiError('Failed to load recently viewed cakes')
        console.error('Error fetching recently viewed cakes:', error)
      }
    }

    fetchRecentlyViewed()
  }, [currentCakeId])

  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <section className="w-full px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-6 px-2">Recently Viewed</h2>
        
        {apiError ? (
          <p className="text-red-500 text-center">{apiError}</p>
        ) : (
          <Carousel 
            className="w-full"
            opts={{
              align: "start",
              loop: recentlyViewed.length > 3
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {recentlyViewed?.map((cake) => (
                <CarouselItem 
                  key={cake._id} 
                  className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Link href={`/cakes/${cake._id}`} className="block h-full">
                    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm sm:text-base line-clamp-1">
                          {cake.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="relative aspect-video w-full overflow-hidden rounded-md">
                          <Image
                            src={cake.image[0] || "/placeholder.svg"}
                            alt={cake.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                        <div className="mt-3 text-sm text-center">
                          <span className="inline-flex items-center">
                            ★ {cake.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block md:block lg:block">
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </div>
          </Carousel>
        )}
      </div>
    </section>
  )
}