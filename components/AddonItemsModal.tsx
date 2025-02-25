/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/CartContext"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, ChevronRight, X, Search, Loader2 } from "lucide-react"
import debounce from 'lodash/debounce'

interface AddonItem {
  _id: string
  name: string
  category: string
  price: number
  description?: string
  image?: string
}

interface AddonItemsModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "buy" | "cart"
}

const CATEGORIES = ["All", "Popular", "Cake Toppers", "Candles", "Other"]
const ITEMS_PER_PAGE = 2

export default function AddonItemsModal({ isOpen, onClose, mode }: AddonItemsModalProps) {
  const [addonItems, setAddonItems] = useState<AddonItem[]>([])
  const [selectedAddons, setSelectedAddons] = useState<{ [key: string]: number }>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { addToCart } = useCart()
  const router = useRouter()
  const [totalAmount, setTotalAmount] = useState(0)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      fetchAddonItems(query, selectedCategory, currentPage)
    }, 500),
    [selectedCategory, currentPage]
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchQuery, debouncedSearch])

  useEffect(() => {
    fetchAddonItems(searchQuery, selectedCategory, currentPage)
  }, [])

  useEffect(() => {
    const total = Object.entries(selectedAddons).reduce((sum, [addonId, quantity]) => {
      const addon = addonItems.find(item => item._id === addonId)
      return sum + (addon?.price || 0) * quantity
    }, 0)
    setTotalAmount(total)
  }, [selectedAddons, addonItems])

  const fetchAddonItems = async (search: string, category: string, page: number) => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: search,
        category: category === "All" ? "" : category
      })

      const response = await fetch(`/api/addon-items?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setAddonItems(data.addonItems)
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE))
      } else {
        throw new Error("Failed to fetch addon items")
      }
    } catch (error) {
      console.error("Error fetching addon items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleAddonSelection = (addonId: string) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: (prev[addonId] || 0) + 1,
    }))
  }

  const handleAddonDeselection = (addonId: string) => {
    setSelectedAddons((prev) => {
      const newQuantity = (prev[addonId] || 0) - 1
      if (newQuantity <= 0) {
        const { [addonId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [addonId]: newQuantity }
    })
  }

  const handleAddToCart = () => {
    Object.entries(selectedAddons).forEach(([addonId, quantity]) => {
      const addon = addonItems.find((item) => item._id === addonId)
      if (addon) {
        // addToCart({
        //   id: addon._id,
        //   name: addon.name,
        //   price: addon.price,
        //   quantity,
        //   image: addon.image || "/placeholder.svg",
        // })
        addToCart({
          id: addon._id,
          caketype:"addon",
          name: addon.name,
          price: addon.price,
          weight:0,
          quantity: quantity,
          image: addon.image || "/placeholder.svg",
          cakeMessage:"",
        })
      }
    })
    router.push("/checkout")
  }

  const handleSkip = () => {
    router.push("/checkout")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                Enhance Your Order
              </DialogTitle>
              <p className="text-gray-500 mt-1">Add these premium items to complete your experience</p>
            </div>
            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="px-6 py-2">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search add-ons..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="whitespace-nowrap pb-2">
            <div className="flex gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="max-h-[60vh] px-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {addonItems.map((addon) => (
                <div
                  key={addon._id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative h-16 w-16">
                      <Image
                        src={addon.image || "/placeholder.svg"}
                        alt={addon.name}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{addon.name}</h3>
                      <p className="text-sm text-gray-500">{addon.description}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">
                        ₹{addon.price.toFixed(2)}
                        </Badge>
                        <Badge variant="outline">
                          {addon.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleAddonDeselection(addon._id)}
                      disabled={!selectedAddons[addon._id]}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center font-medium">
                      {selectedAddons[addon._id] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleAddonSelection(addon._id)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-6 pt-2">
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className="w-8 h-8 p-0"
                disabled={isLoading}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-center">
            {/* <div>
              <p className="text-sm text-gray-500">Total Add-ons</p>
              <p className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
            </div> */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="w-24"
              >
                Skip
              </Button>
              <Button
                onClick={handleAddToCart}
                className="w-32"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}