"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Heart, ShoppingCart, Trash2, HeartOff } from "lucide-react"

interface WishlistItem {
  _id: string
  cakeId: string
  name: string
  caketype: string
  image: string
  price: number
  weight: number
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const { data: session } = useSession()
  const { addToCart } = useCart()
  const { toast } = useToast()
   // Redirect if not logged in or cart is empty
    if (!session) {
      redirect('/login');
    }

  useEffect(() => {
    if (session) {
      fetchWishlistItems()
    }
  }, [session])

  const fetchWishlistItems = async () => {
    try {
      const response = await fetch("/api/wishlist")
      const data = await response.json()
      setWishlistItems(data)
    } catch (error) {
      console.error("Error fetching wishlist items:", error)
      toast({
        title: "Error",
        description: "Failed to fetch wishlist items. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeFromWishlist = async (id: string) => {
    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setWishlistItems((prevItems) => prevItems.filter((item) => item._id !== id))
        toast({
          title: "Item removed",
          description: "The item has been removed from your wishlist.",
        })
      } else {
        throw new Error("Failed to remove item from wishlist")
      }
    } catch (error) {
      console.error("Error removing item from wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.cakeId,
      name: item.name,
      caketype: item.caketype,
      price: item.price,
      quantity: 1,
      image: item.image,
      weight: item.weight, // You might want to add weight to the wishlist item model if needed
      cakeMessage:""
    })
    toast({
      title: "Added to cart",
      description: "The item has been added to your cart.",
    })
  }

  if (!session) {
    return <p>Please log in to view your wishlist.</p>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-pink to-brand-pink-light flex items-center justify-center shadow-soft">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-text">
            My Wishlist
          </h1>
        </div>
        <p className="text-brand-text-secondary mt-1 ml-[52px]">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
        </p>
        <div className="h-1 w-16 bg-gradient-to-r from-brand-pink to-brand-pink-light rounded-full mt-4" />
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
          <div className="w-24 h-24 rounded-full bg-brand-cream flex items-center justify-center mb-6">
            <HeartOff className="w-12 h-12 text-brand-pink/60" />
          </div>
          <h3 className="text-xl font-display font-semibold text-brand-text">Your wishlist is empty</h3>
          <p className="text-brand-text-secondary mt-2 text-center max-w-sm">
            Browse our collection and save your favorite treats for later.
          </p>
          <Link
            href="/cakes"
            className="mt-6 inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-brand-pink to-brand-pink-light text-white font-semibold shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
          >
            Explore Cakes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item, index) => (
            <div
              key={item._id}
              className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100/80 hover:-translate-y-1"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Image Section */}
              <Link href={`/cakes/${item.cakeId}`} className="block relative">
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {/* Wishlist Heart Badge */}
                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-soft">
                  <Heart className="w-4.5 h-4.5 text-brand-pink fill-brand-pink" />
                </div>
              </Link>

              {/* Content Section */}
              <div className="p-5">
                <Link href={`/cakes/${item.cakeId}`}>
                  <h3 className="font-display font-bold text-lg text-brand-text group-hover:text-brand-pink transition-colors duration-300 line-clamp-1">
                    {item.name}
                  </h3>
                </Link>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-brand-text">{'\u20B9'}{item.price.toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-3">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-brand-pink to-brand-pink-light text-white font-semibold shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5 border-0"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeFromWishlist(item._id)}
                    className="h-11 w-11 rounded-xl border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 p-0 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
