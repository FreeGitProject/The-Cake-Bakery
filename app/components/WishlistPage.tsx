"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
//import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { redirect } from "next/navigation"

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item._id}>
              
              <CardHeader>
              <div className="flex justify-between items-start">
          <Link href={`/cakes/${item.cakeId}`} className="w-full">
         

            <CardTitle className="text-2xl font-bold from-primary to-primary-foreground bg-clip-text  line-clamp-1">
              {item.name}
            </CardTitle>
          </Link>
        </div>
               
                {/* <CardTitle>{item.name}</CardTitle> */}
               
              </CardHeader>
             
              <CardContent>
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover mb-4"
                />
                <p className="font-bold text-lg">₹{item.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => removeFromWishlist(item._id)}>
                  Remove
                </Button>
                <Button onClick={() => handleAddToCart(item)}>Add to Cart</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

