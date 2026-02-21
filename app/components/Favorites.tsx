"use client"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { useFavorites } from '@/lib/useData'
import { motion } from 'framer-motion'
import { ShoppingBag, Star } from 'lucide-react'

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

export default function Favorites() {
  const { data: favorites } = useFavorites()
  const { addToCart } = useCart()

  const handleAddToCart = (cake: Cake) => {
    addToCart({
      id: cake._id,
      name: cake.name,
      caketype: cake.caketype,
      price: cake.prices[0].sellPrice,
      weight: cake.prices[0].weight,
      quantity: 1,
      image: cake.image[0],
      cakeMessage: ""
    })
  }

  return (
    <section id="favorites" className="py-24 bg-[#FAFAFA]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-semibold tracking-widest uppercase text-[#FF9494] mb-3">
            Most Loved
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text mb-4">
            Our Favorites
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] mx-auto rounded-full mb-4" />
          <p className="text-brand-text-secondary max-w-xl mx-auto text-sm sm:text-base">
            Discover our most beloved and popular cake selections that have won hearts
          </p>
        </motion.div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites?.map((cake, index) => (
            <motion.div
              key={cake._id}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={cake.image[0]}
                    alt={cake.name}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Overlay gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {!cake.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-white text-sm font-semibold px-5 py-2 bg-red-500/90 rounded-full backdrop-blur-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Rating Badge */}
                  {cake.averageRating > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-soft">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-brand-text">{cake.averageRating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md ${
                      cake.type === "eggless"
                        ? "bg-green-500/90 text-white"
                        : "bg-amber-500/90 text-white"
                    }`}>
                      {cake.type === "eggless" ? "Eggless" : "Egg"}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-5">
                  <Link href={`/cakes/${cake._id}`}>
                    <h3 className="text-base font-semibold text-brand-text mb-1.5 group-hover:text-[#FF9494] transition-colors duration-300 line-clamp-1">
                      {cake.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-brand-text-secondary line-clamp-2 mb-4 leading-relaxed">
                    {cake.description}
                  </p>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xl font-bold text-brand-text">
                        &#8377;{cake.prices[0].sellPrice.toFixed(0)}
                      </span>
                      <span className="text-xs text-brand-text-secondary ml-1">
                        / {cake.prices[0].weight}kg
                      </span>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(cake)}
                      disabled={!cake.isAvailable}
                      className={`rounded-xl text-sm font-medium px-4 py-2 h-auto transition-all duration-300
                        ${cake.isAvailable
                          ? 'bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white hover:-translate-y-0.5'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                      `}
                    >
                      {cake.isAvailable ? (
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4" />
                          Add
                        </span>
                      ) : 'Sold Out'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
