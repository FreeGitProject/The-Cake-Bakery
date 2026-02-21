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
import { ShoppingCart, ChevronRight, X, Search, Loader2, Gift, Minus, Plus } from "lucide-react"
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

  const selectedCount = Object.values(selectedAddons).reduce((sum, qty) => sum + qty, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 rounded-2xl border-gray-100 shadow-elevated overflow-hidden">
        {/* Gradient accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9494] via-[#FFB4B4] to-[#FFD1D1]" />

        <DialogHeader className="px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#FF9494] to-[#FFB4B4] p-2.5 rounded-xl shadow-soft">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl text-brand-text">
                Enhance Your Order
              </DialogTitle>
              <p className="text-sm text-brand-text-secondary mt-0.5">Add premium items to complete your experience</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-3">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-pink/50" />
            <Input
              placeholder="Search add-ons..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 transition-colors bg-brand-cream/20 h-11"
            />
          </div>

          {/* Category pills */}
          <ScrollArea className="whitespace-nowrap pb-2">
            <div className="flex gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                  className={`rounded-xl transition-all duration-300 text-sm ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white border-transparent shadow-soft hover:shadow-glow hover:text-white"
                      : "border-gray-200 text-brand-text-secondary hover:border-brand-pink/30 hover:bg-brand-cream/40 hover:text-brand-text"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator className="bg-gray-100" />

        {/* Items list */}
        <ScrollArea className="max-h-[50vh] px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-brand-pink border-t-transparent animate-spin mb-3" />
              <p className="text-sm text-brand-text-secondary">Loading add-ons...</p>
            </div>
          ) : addonItems.length > 0 ? (
            <div className="grid gap-3 py-4">
              {addonItems.map((addon) => (
                <div
                  key={addon._id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                    selectedAddons[addon._id]
                      ? "border-brand-pink/30 bg-brand-cream/30 shadow-soft"
                      : "border-gray-100 bg-white hover:border-brand-pink/20 hover:shadow-soft"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={addon.image || "/placeholder.svg"}
                        alt={addon.name}
                        fill
                        className="rounded-xl object-cover ring-1 ring-gray-100 shadow-sm"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-text text-sm">{addon.name}</h3>
                      {addon.description && (
                        <p className="text-xs text-brand-text-secondary mt-0.5 line-clamp-1">{addon.description}</p>
                      )}
                      <div className="flex gap-2 mt-1.5">
                        <Badge className="bg-brand-cream text-brand-pink border-0 rounded-lg text-xs font-semibold hover:bg-brand-cream">
                          ₹{addon.price.toFixed(2)}
                        </Badge>
                        <Badge variant="outline" className="border-gray-200 text-brand-text-secondary rounded-lg text-xs">
                          {addon.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-8 w-8 rounded-lg border-gray-200 transition-all duration-300 ${
                        selectedAddons[addon._id]
                          ? "hover:border-brand-pink hover:text-brand-pink"
                          : "opacity-40"
                      }`}
                      onClick={() => handleAddonDeselection(addon._id)}
                      disabled={!selectedAddons[addon._id]}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className={`w-7 text-center font-semibold text-sm ${
                      selectedAddons[addon._id] ? "text-brand-pink" : "text-brand-text-secondary"
                    }`}>
                      {selectedAddons[addon._id] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-gray-200 hover:border-brand-pink hover:text-brand-pink hover:bg-brand-cream/40 transition-all duration-300"
                      onClick={() => handleAddonSelection(addon._id)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-brand-cream rounded-xl flex items-center justify-center mx-auto mb-3">
                <Search className="h-5 w-5 text-brand-pink" />
              </div>
              <p className="text-sm text-brand-text-secondary">No add-ons found</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 pt-3 bg-gradient-to-t from-gray-50/80 to-white">
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 p-0 rounded-lg transition-all duration-300 ${
                    currentPage === i + 1
                      ? "bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white border-transparent shadow-soft"
                      : "border-gray-200 text-brand-text-secondary hover:border-brand-pink/30 hover:text-brand-pink"
                  }`}
                  disabled={isLoading}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}

          <Separator className="mb-4 bg-gray-100" />

          {/* Selected count indicator */}
          {selectedCount > 0 && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge className="bg-brand-cream text-brand-pink border-0 rounded-lg text-xs font-semibold hover:bg-brand-cream">
                {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="w-28 rounded-xl border-gray-200 text-brand-text-secondary hover:border-brand-pink/30 hover:text-brand-text hover:bg-brand-cream/30 h-11 transition-all duration-300"
            >
              Skip
            </Button>
            <Button
              onClick={handleAddToCart}
              className="w-36 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white rounded-xl h-11 transition-all duration-300 hover:-translate-y-0.5"
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
