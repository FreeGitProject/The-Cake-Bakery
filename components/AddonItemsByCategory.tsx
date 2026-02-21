import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { Plus, Gift, Sparkles } from "lucide-react"

interface AddonItem {
  _id: string
  name: string
  category: string
  price: number
  description?: string
  image?: string
  popular?: boolean
}

export default function CheckoutWithAddons() {
  const [addonItems, setAddonItems] = useState<AddonItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("")
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    fetchAddonItems()
  }, [])

  const fetchAddonItems = async () => {
    try {
      const response = await fetch("/api/addon-items")
      if (response.ok) {
        const data = await response.json()
        setAddonItems(data.addonItems)
        if (data.addonItems.length > 0) {
          setActiveCategory(data.addonItems[0].category)
        }
      } else {
        throw new Error("Failed to fetch addon items")
      }
    } catch (error) {
      console.error("Error fetching addon items:", error)
      toast({
        title: "Error",
        description: "Failed to fetch addon items. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddAddon = (item: AddonItem) => {
    addToCart({
      id: item._id,
      caketype:"addon",
      name: item.name,
      price: item.price,
      weight:0,
      quantity: 1,
      image: item.image || "/placeholder.svg",
      cakeMessage:"",
    })
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your order.`,
    })
  }

  const groupedAddons = addonItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, AddonItem[]>
  )

  const categories = Object.keys(groupedAddons)

  return (
    <div className="w-full mt-8 bg-white rounded-2xl shadow-card border border-gray-100/80 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-cream/60 to-white px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#FF9494] to-[#FFB4B4] p-2.5 rounded-xl shadow-soft">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-brand-text">Enhance Your Order</h3>
            <p className="text-sm text-brand-text-secondary">Add these delicious items to make your order extra special</p>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-100" />

      <div className="p-6">
        <Tabs
          defaultValue={activeCategory}
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList className="w-full justify-start mb-6 overflow-x-auto bg-brand-cream/40 rounded-xl p-1 h-auto">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="min-w-fit rounded-lg text-sm py-2.5 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF9494] data-[state=active]:to-[#FFB4B4] data-[state=active]:text-white data-[state=active]:shadow-soft text-brand-text-secondary transition-all duration-300"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-3 md:-ml-4">
                  {groupedAddons[category].map((item) => (
                    <CarouselItem
                      key={item._id}
                      className="pl-3 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                    >
                      <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100/80 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {item.popular && (
                            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 rounded-lg shadow-soft text-xs">
                              <Sparkles className="w-3 h-3 mr-1" /> Popular
                            </Badge>
                          )}
                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-display font-semibold text-brand-text">
                              {item.name}
                            </h3>
                            <span className="font-bold text-brand-pink text-lg">
                              ₹{item.price.toFixed(2)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-brand-text-secondary mb-4 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          <Button
                            type="button"
                            onClick={() => handleAddAddon(item)}
                            className="w-full bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white rounded-xl h-10 transition-all duration-300 hover:-translate-y-0.5"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Order
                          </Button>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4 rounded-xl bg-white/90 backdrop-blur-sm shadow-soft hover:shadow-card border-gray-100" />
                <CarouselNext className="hidden md:flex -right-4 rounded-xl bg-white/90 backdrop-blur-sm shadow-soft hover:shadow-card border-gray-100" />
              </Carousel>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
