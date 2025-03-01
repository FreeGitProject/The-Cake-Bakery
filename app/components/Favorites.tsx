"use client"
//import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

// interface Cake {
//   _id: string
//   name: string
//   caketype: string
//   description: string
//   image: string[]
//   price: number
//   isAvailable: boolean
// }
interface Price {
  weight: number;
  sellPrice: number;
}
interface Reviews {
  userId: string;
  rating: number;
}
interface Cake {
  _id: string;
  name: string;
  description: string;
  caketype: "cake" | "pastries";
  type: "contains egg" | "eggless";
  prices: Price[];
  image: string[];
  reviews: Reviews[];
  averageRating: number;
  isAvailable: boolean;
}

export default function Favorites({favorites}:{favorites:Cake[] | null}) {
  //const [favorites, setFavorites] = useState<Cake[]>([])
 const { addToCart } = useCart()
  // useEffect(() => {
  //   async function fetchFavorites() {
  //     try {
  //       const res = await fetch('/api/favorites')
  //       const data = await res.json()
  //       setFavorites(data)
  //     } catch (error) {
  //       console.error('Error fetching favorites:', error)
  //     }
  //   }
  //   fetchFavorites()
  // }, [])
  const handleAddToCart = (cake: Cake) => {
    addToCart({
      id: cake._id,
      name: cake.name,
      caketype: cake.caketype,
      price: cake.prices[0].sellPrice,
      weight: cake.prices[0].weight,
      quantity: 1,
      image: cake.image[0],
      cakeMessage:""
    })
  }
  return (
    <section id="favorites" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#4A4A4A] mb-4 relative inline-block">
            Our Favorites
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FF9494] rounded-full"></div>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            Discover our most beloved and popular cake selections that have won hearts
          </p>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites?.map((cake) => (
            <div 
              key={cake._id} 
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-fadeIn"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={cake.image[0]}
                  alt={cake.name}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                {!cake.isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold px-4 py-2 bg-red-500 rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Content Container */}
              <div className="p-6">
              <Link href={`/cakes/${cake._id}`} className="w-full">
                <h3 className="text-xl font-semibold mb-2 text-[#4A4A4A] group-hover:text-[#FF9494] transition-colors duration-300">
                  {cake.name}
                </h3>
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {cake.description}
                </p>
                
                {/* Price and Action */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-[#FF9494]">
                    ₹{cake.prices[0].sellPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(cake)}
                    disabled={!cake.isAvailable}
                    className={`
                      px-6 py-2 rounded-full transition-all duration-300
                      ${cake.isAvailable 
                        ? 'bg-[#FF9494] hover:bg-[#FFB4B4] text-white transform hover:-translate-y-1' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
                    `}
                  >
                    {cake.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>

              {/* Quick View Overlay (Optional) */}
              {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="inline-block bg-white px-4 py-2 rounded-full text-sm font-semibold text-[#FF9494]">
                    Quick View
                  </span>
                </div>
              </div> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

