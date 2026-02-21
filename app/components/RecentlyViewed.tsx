"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Clock } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Cake {
  _id: string;
  name: string;
  image: string[];
  averageRating: number;
}

export default function RecentlyViewed({
  currentCakeId,
}: {
  currentCakeId: string;
}) {
  const [recentlyViewed, setRecentlyViewed] = useState<Cake[]>([]);
  const [apiError, setApiError] = useState<string>("");
  const [recentViewsLimit, setRecentViewsLimit] = useState(5);
  useEffect(() => {
    const fetchSettings = async () => {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const settings = await response.json();
        setRecentViewsLimit(settings.recentViewsCount);
      }
    };
    fetchSettings();
  }, []);
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const storedIds = JSON.parse(
          localStorage.getItem("recentlyViewedCakes") || "[]"
        );
        const uniqueIds = Array.from(
          new Set([currentCakeId, ...storedIds])
        ).slice(0, recentViewsLimit);

        localStorage.setItem("recentlyViewedCakes", JSON.stringify(uniqueIds));

        const cakes = await Promise.all(
          uniqueIds
            .filter((id) => id !== currentCakeId)
            .map(async (id) => {
              const response = await fetch(`/api/cakes/${id}`);
              if (!response.ok) {
                throw new Error(`Failed to fetch cake ${id}`);
              }
              return response.json();
            })
        );

        setRecentlyViewed(cakes);
      } catch (error) {
        setApiError("Failed to load recently viewed cakes");
        console.error("Error fetching recently viewed cakes:", error);
      }
    };

    fetchRecentlyViewed();
  }, [currentCakeId, recentViewsLimit]);

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-pink to-brand-pink-light flex items-center justify-center shadow-soft">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-brand-text">
              Recently Viewed
            </h2>
            <p className="text-sm text-brand-text-secondary mt-0.5">
              Continue where you left off
            </p>
          </div>
        </div>

        {apiError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <p className="text-rose-600 text-sm font-medium">{apiError}</p>
          </div>
        ) : (
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: recentlyViewed.length > 3,
            }}
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {recentlyViewed?.map((cake) => (
                <CarouselItem
                  key={cake._id}
                  className="pl-3 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Link href={`/cakes/${cake._id}`} className="block h-full group">
                    <div className="h-full bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100/80 group-hover:-translate-y-1">
                      {/* Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={cake.image[0] || "/placeholder.svg"}
                          alt={cake.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {/* Subtle gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-display font-semibold text-brand-text text-sm sm:text-base line-clamp-1 group-hover:text-brand-pink transition-colors duration-300">
                          {cake.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= Math.floor(cake.averageRating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-200 fill-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-brand-text-secondary">
                            {cake.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="left-0 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm border-gray-200 shadow-soft hover:shadow-card hover:bg-white transition-all duration-300" />
              <CarouselNext className="right-0 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm border-gray-200 shadow-soft hover:shadow-card hover:bg-white transition-all duration-300" />
            </div>
          </Carousel>
        )}
      </div>
    </section>
  );
}
